import { Component, OnInit } from '@angular/core';
import { DataProvider } from '../../providers/provider-data';
import { AlertController, ModalController } from '@ionic/angular';
import { TransactionsComponent } from '../../component/transactions/transactions.component';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';
import { AccountInfoComponent } from '../../component/account-info/account-info.component';
import { OperationTools, AccountTotals } from '../../providers/operation-tools';
import { TranslateService } from '@ngx-translate/core';


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
  group: any;
  groupid: string;
  meeting: any;
  accounts: any;
  new_totals: AccountTotals = {
    cash: 0.00,
    balance: 0.00,
    credit: 0.00
  }
  selectedAll: boolean = false;
  selectedAccounts = 0;

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
    this.currency = this.dataProvider.current.country.currency;

    this.load_accounts();
  }

  load_accounts(){
    this.dataProvider.fetch_data('accounts', this.group.id, true).then(async (data: any)=> {
      this.accounts = data.filter((s)=> s.statut == 0); //active accounts
      let transactions = await this.storage.get(this.config.TRANSACTIONS_FILE);
      let upload_errors = await this.storage.get(this.config.UPLOAD_ERRORS_FILE);

      // load pending transactions for each account
      this.accounts.forEach(async (acc) => {
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
        if(acc.type == 2){
          // get meeting history from api
          await this.dataProvider.refreshMeetingHistory(this.meeting);
          this.new_totals = await this.operTools.estimate_account_totals(acc, this.meeting.id);
        }
      });
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
          this.dataProvider.delOperation(tr).then(() => this.load_accounts());
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
