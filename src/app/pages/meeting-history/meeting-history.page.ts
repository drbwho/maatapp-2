import { Component, OnInit } from '@angular/core';
import { DataProvider } from '../../providers/provider-data';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';
import { OperationTools } from '../../providers/operation-tools';
import { MeetingTotals } from '../../interfaces/data-interfaces';
import { HistoryComponent } from '../../component/history/history.component';

@Component({
    selector: 'app-meeting-history',
    templateUrl: './meeting-history.page.html',
    styleUrls: ['./meeting-history.page.scss'],
    standalone: false
})
export class MeetingHistoryPage implements OnInit {
  country: any = {flagcode: 'gb'};
  group: any;
  meeting: any;
  allaccounts: any;
  accounts: any;
  status: string;
  fullDate: string;
  num_ECP = 0;
  new_totals: MeetingTotals = {
    debit: 0.00,
    newbalance: 0.00,
    credit: 0.00,
    loans: 0.00
  }
  attendance = 0;
  selectedAll: boolean = false;
  selectedAccounts = 0;
  show_group_transactions = false;
  group_transactions: any = null;
  public pf = parseFloat;

  constructor(
    private dataProvider: DataProvider,
    private modalCtrl: ModalController,
    private storage: Storage,
    private config: ConfigData,
    private operTools: OperationTools,
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.meeting = this.dataProvider.current.meeting;
    this.group = this.dataProvider.current.group;
    this.country = this.dataProvider.current.country;
    this.num_ECP = await this.operTools.get_num_of_ECP(this.meeting, this.country.id);
    this.new_totals = await this.operTools.estimate_meeting_totals(null, this.meeting.id);

    this.attendance = this.meeting.absences ? this.group.numberofmembers - this.meeting.absences.length : this.group.numberofmembers;

    this.dataProvider.fetch_data('params', this.country.id, true).then((data: any)=> {
      this.country.parameters = data;
    });

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

  async load_accounts(){
    // Merge pending and uploaded transactions
    let transactions = await this.storage.get(this.config.TRANSACTIONS_FILE);
    let uploaded = await this.storage.get(this.config.HISTORY_TRANSACTIONS_FILE);
    if(transactions && uploaded){
      transactions = [...transactions, ...uploaded];
    }else if(uploaded){
      transactions = uploaded;
    }
    transactions = transactions.filter(t => t.idmeeting == this.meeting.id);
    let upload_errors = await this.storage.get(this.config.UPLOAD_ERRORS_FILE);

    this.dataProvider.fetch_data('accounts', this.group.id, true, true).then(async (data: any)=> {
      // Group transactions
      this.group.account = data.find((s)=> s.idowner == this.group.id);
      this.group_transactions = transactions.filter(t => t.idaccount == this.group.account.id);
      
      this.allaccounts = data.filter((s)=> s.statut == 0); //active accounts
      // load pending transactions for each account
      this.allaccounts.forEach(async (acc) => {
        if(transactions){
          //append upload errors to transactions
          acc.transactions = transactions.filter((s)=> (s.idaccount == acc.id  || s.idorigin == acc.id) && s.idmeeting == this.meeting.id);
          if(upload_errors){
            acc.transactions.forEach((tr)=>{
              var uplerr = upload_errors.find((s)=> s.idmeeting == tr.idmeeting && (s.idaccount == tr.idaccount || s.idaccount == tr.idorigin) && s.idparameter == tr.idparameter);
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
        if( acc.dateecheance != null && (new Date(acc.dateecheance) < (new Date())) && parseFloat(acc.restearembourser) > 0){
          acc.loans_expired = true;
        }
        if( acc.sfdateecheance != null && (new Date(acc.sfdateecheance) < (new Date())) && parseFloat(acc.sfrestearembourser) > 0){
          acc.sfloans_expired = true;
        }
        // Calc meeting totals
        let account_totals = await this.operTools.estimate_meeting_totals(acc, this.meeting.id);

        acc.missing_contribs = false;
        if(!account_totals.transactions.get('RCB') && parseFloat(this.group.settings.regcontribution) > 0){
          acc.missing_rcb = (parseFloat(acc.due_reg) < 0 ? parseFloat(acc.due_reg) : 0.0) + this.group.settings.regcontribution; //contributions surplus?
          acc.missing_rcb < 0 ? acc.missing_rcb = 0 : acc.missing_contribs = true;
        }
        if(!account_totals.transactions.get('AST') && parseFloat(this.group.settings.regfacilpayment) > 0){
          acc.missing_fcp = (parseFloat(acc.due_sf) < 0 ? parseFloat(acc.due_sf) : 0.0) + this.group.settings.regfacilpayment;
          acc.missing_fcp < 0 ? acc.missing_fcp = 0 : acc.missing_contribs = true;
        }
        if(!account_totals.transactions.get('AID') && parseFloat(this.group.settings.regsfcontribution) > 0){
          acc.missing_sfcb = (parseFloat(acc.due_facp) < 0 ? parseFloat(acc.due_facp) : 0.0) + this.group.settings.regsfcontribution;
          acc.missing_sfcb < 0 ? acc.missing_sfcb = 0 : acc.missing_contribs = true;
        }
        if(account_totals.transactions.get('FIN')){
          acc.appliedfines = account_totals.transactions.get('FIN');
        }
        acc.meeting_balance = 0;
        if(account_totals.transactions.get('ECP')){
          acc.meeting_balance = account_totals.transactions.get('ECP');
        }

        // faces
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

  deleteErrorTransaction(tr: any){
    this.operTools.delOperation(tr).then(async () => {
      let upload_errors = await this.storage.get(this.config.UPLOAD_ERRORS_FILE);
      upload_errors = upload_errors.filter(u=> !(u.idmeeting == tr.idmeeting && u.idaccount == tr.idaccount && u.idparameter == tr.idparameter));
      this.storage.set(this.config.UPLOAD_ERRORS_FILE, upload_errors).then(()=>{
        this.load_accounts();
      });
    });
  }

  /*selectAll(){
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
            let index = transactions.findIndex(s => s.idaccount == tr.idaccount && s.idmeeting == tr.idmeeting && s.idparameter == tr.idparameter && s.amount == tr.amount);
            transactions.splice(index, 1);//remove element from array
            this.storage.set(this.config.TRANSACTIONS_FILE, transactions).then(()=>{
              this.load_accounts();
            })*/
            /*this.operTools.delOperation(tr).then(() => this.load_accounts());
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
        transactions = transactions.filter((s)=>s.idmeeting == this.meeting.id);
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
      componentProps: {'account': account, 'currency': this.country.currency, 'show_transactions': false, 'group_totals': group_totals}
    });
    modal.present();

    await modal.onWillDismiss();
  }*/

  async showTransactions(account){

    let parameters = this.country.parameters;
    let totals = await this.operTools.estimate_meeting_totals(account, this.meeting.id);
    let transactions: any = [];
    totals.transactions.forEach((amount, code) => {
      let param = parameters.find(p => p.code == code);
      transactions.push({
        id: param.id,
        name: param.name,
        code: param.code,
        icon: this.operTools.tr_icons[param.code],
        amount: amount
      })
    });
    const modal = await this.modalCtrl.create({
      component: HistoryComponent,
      initialBreakpoint: 0.5,
      breakpoints: [0, 0.5, 0.7],
      componentProps: {account: account, transactions: transactions, currency: this.country.currency},
      cssClass: 'action-modal-sheet'
    });
    modal.present();

    await modal.onWillDismiss();
  }

}
