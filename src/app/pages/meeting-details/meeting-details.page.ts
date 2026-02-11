import { Component, OnInit } from '@angular/core';
import { DataProvider } from '../../providers/provider-data';
import { AlertController, ModalController } from '@ionic/angular';
import { TransactionsComponent } from '../../component/transactions/transactions.component';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';
import { AccountInfoComponent } from '../../component/account-info/account-info.component';
import { OperationTools } from '../../providers/operation-tools';
import { TranslateService } from '@ngx-translate/core';
import { MeetingTotals } from '../../interfaces/data-interfaces';

@Component({
    selector: 'app-meeting-details',
    templateUrl: './meeting-details.page.html',
    styleUrls: ['./meeting-details.page.scss'],
    standalone: false
})
export class MeetingDetailsPage implements OnInit {
  meetingplace: string;
  meetingdate: string;
  groupname: string;
  currency: string;
  country: any;
  group: any;
  groupid: string;
  meeting: any;
  allaccounts: any;
  accounts: any;
  status: string;
  fullDate: string;
  num_ECP = 0;
  new_totals: MeetingTotals = {
    cash: 0.00,
    balance: 0.00,
    credit: 0.00,
    loans: 0.00
  }
  selectedAll: boolean = false;
  selectedAccounts = 0;
  public pf = parseFloat;

  constructor(
    private dataProvider: DataProvider,
    private modalCtrl: ModalController,
    private storage: Storage,
    private config: ConfigData,
    private alertCtrl: AlertController,
    private operTools: OperationTools,
    private translate: TranslateService
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.meeting = this.dataProvider.current.meeting;
    this.meetingplace = this.meeting.place;
    this.meetingdate = this.meeting.startedat;
    this.group = this.dataProvider.current.group;
    this.groupname = this.group.name;
    this.groupid = this.group.id;
    this.country = this.dataProvider.current.country;
    this.currency = this.country.currency;
    this.num_ECP = await this.operTools.get_num_of_ECP(this.meeting, this.country.id);
    this.new_totals = await this.operTools.estimate_meeting_totals(null, this.meeting.id);

    this.calc_status();
    await this.load_accounts();
  }

  calc_status(){
    if(this.meeting.endedat){
      if(this.meeting.haspending){
        this.status ='closed-pending';
      }else{
        this.status = 'closed';
      }
    }else{
      this.status = 'progress';
    }
    this.fullDate = this.meeting.endedat ? this.meeting.endedat : this.meeting.startedat;
  }

  load_accounts(){
    this.dataProvider.fetch_data('accounts', this.group.id, true, true).then(async (data: any)=> {
      this.allaccounts = data.filter((s)=> s.statut == 0); //active accounts
      let transactions = await this.storage.get(this.config.TRANSACTIONS_FILE);
      let upload_errors = await this.storage.get(this.config.UPLOAD_ERRORS_FILE);

      // load pending transactions for each account
      this.allaccounts.forEach(async (acc) => {
        if(transactions){
          //append upload errors to transactions
          acc.transactions = transactions.filter((s)=>s.accountid == acc.id && s.meetingid == this.meeting.id);
          if(upload_errors){
            acc.transactions.forEach((tr)=>{
              let uplerr = upload_errors.find((s)=> s.meetingid == tr.meetingid && s.accountid == tr.accountid && s.parameterid == tr.parameterid);
              if(uplerr){
                tr.error = uplerr.message;
              }
            });
          }
        }
        /*if(acc.type == 2){
          // get meeting history from api
          await this.operTools.refreshMeetingHistory(this.meeting.id);
          this.new_totals = await this.operTools.estimate_meeting_totals(acc, this.meeting.id);
        }*/
        // loan overdues
        if( acc.dateecheance != null && (new Date(acc.dateecheance) < (new Date()))){
          acc.loans_expired = true;
        }
        if( acc.sfdateecheance != null && (new Date(acc.sfdateecheance) < (new Date()))){
          acc.sfloans_expired = true;
        }
        // Calc meeting dues
        acc.missing_contribs = false;
        let account_totals = await this.operTools.estimate_meeting_totals(acc, this.meeting.id); 
        if(!account_totals.transactions.get('RCB') && parseFloat(this.group.settings.regcontribution) > 0){
          acc.missing_rcb = this.group.settings.regcontribution;
          acc.missing_contribs = true;
        }
        if(!account_totals.transactions.get('AST') && parseFloat(this.group.settings.regfacilpayment) > 0){
          acc.missing_fcp = this.group.settings.regfacilpayment;
          acc.missing_contribs = true;
        }
        if(!account_totals.transactions.get('AID') && parseFloat(this.group.settings.regsfcontribution) > 0){
          acc.missing_sfcb = this.group.settings.regsfcontribution;
          acc.missing_contribs = true;
        }
        if(account_totals.transactions.get('FIN')){
          acc.appliedfines = account_totals.transactions.get('FIN');
        }

        // dues
        acc.status = "happy";
        if(acc.missing_contribs){ //acc.due
          acc.status = "neutral";
        }
        if(acc.loans_expired || acc.sfloans_expired){
          acc.status = "sad";
        }
      });
      // Show only member accounts
      this.accounts = this.allaccounts.filter((a)=> a.type == 1);
    });
  }

  selectAll(){
    this.selectedAll = this.selectedAll ? false : true;
    this.accounts.forEach(a => {
      if(a.type == 1){
        a.selected = this.selectedAll;
      }
    });
    this.selectedAccounts = this.selectedAll ? this.accounts.filter(e => e.selected === true).length : 0;
  }

  selectAccount(account){
    if(account.type == 1){
      account.selected = account.selected ? false : true;
      this.selectedAccounts = this.accounts.filter(e => e.selected === true).length;
      this.selectedAll = false;
    }
  }

  async deleleTransaction(event: Event, tr: any){
    //prevent ion-item click
    event.stopPropagation();
    this.translate.get(['are_you_sure','no','yes']).subscribe(async (keys: any)=>{
      const alert = await this.alertCtrl.create({
        header: keys['are_you_sure'],
        buttons: [
        {
          text: keys['no'],
        },
        {
          text: keys['yes'],
          handler: async () => {
            /*let transactions = await this.storage.get(this.config.TRANSACTIONS_FILE);
            //find index
            let index = transactions.findIndex(s => s.accountid == tr.accountid && s.meetingid == tr.meetingid && s.parameterid == tr.parameterid && s.amount == tr.amount);
            transactions.splice(index, 1);//remove element from array
            this.storage.set(this.config.TRANSACTIONS_FILE, transactions).then(()=>{
              this.load_accounts();
            })*/
          this.operTools.delOperation(tr).then(() => this.load_accounts());
          },
        },
        ],
      });
      await alert.present();
    });
  }

  async addTransactionModal(event: Event, account: any) {
    //prevent ion-item click
    event.stopPropagation();

    const modal = await this.modalCtrl.create({
      component: TransactionsComponent,
      componentProps: {account: account, accounts: this.accounts}
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      // refresh accounts totals
      this.selectedAccounts = 0;
      this.selectedAll = false;
      this.load_accounts();
    }
  }

  async showAccountInfo(event: Event, account){
    //prevent ion-item click
    event.stopPropagation();

    let group_totals = null;

    if(account.type == 2){
      let trs = [];
      let transactions = await this.storage.get(this.config.TRANSACTIONS_FILE);
      if(transactions){
        transactions = transactions.filter((s)=>s.meetingid == this.meeting.id);
        transactions.forEach((tr)=>{
          if(trs[tr.parametername] != undefined){
            trs[tr.parametername] += tr.amount;
          }else{
            trs[tr.parametername] = tr.amount;
          }
        })
      }
      group_totals = {'transactions': trs}
    }
    const modal = await this.modalCtrl.create({
      component: AccountInfoComponent,
      componentProps: {'account': account, 'currency': this.currency, 'show_transactions': false, 'group_totals': group_totals}
    });
    modal.present();

    await modal.onWillDismiss();
  }

}
