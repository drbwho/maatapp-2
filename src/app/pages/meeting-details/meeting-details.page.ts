import { Component, OnInit } from '@angular/core';
import { DataProvider } from '../../providers/provider-data';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { TransactionsComponent } from '../../component/transactions/transactions.component';
import { Events } from '../../providers/events';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';
import { AccountInfoComponent } from '../../component/account-info/account-info.component';
import { isThisSecond } from 'date-fns';
import { tr } from 'date-fns/locale';

@Component({
  selector: 'app-meeting-details',
  templateUrl: './meeting-details.page.html',
  styleUrls: ['./meeting-details.page.scss'],
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
  new_credit = 0.00;
  new_balance = 0.00;
  new_cashbox = 0.00;

  constructor(
    private dataProvider: DataProvider,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private storage: Storage,
    private config: ConfigData,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    const meetingId = this.route.snapshot.paramMap.get('meetingId');
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
      if(transactions == null){
        return;
      }
      // load pending transactions for each account
      this.accounts.forEach(async (acc) => {
        acc.transactions = transactions.filter((s)=>s.accountid == acc.id && s.meetingid == this.meeting.id);
        if(acc.type == 2){
          this.estimate_group_totals(acc);
        }
      });
    });
  }

  /*
  * Estimate Group credit from pending transactions
  *
  */
  estimate_group_totals (account: any): any {
      let transactions = this.storage.get(this.config.TRANSACTIONS_FILE).then(async (data)=>{
        let trans = data.filter(s=>s.meetingid == this.meeting.id);
        let credittypes = ['ECP', 'RCB', 'REM', 'SFREM', 'FIN', 'ENF', 'PCO', 'CFS', 'AST', 'AID', 'SFND'];
        let debittypes = ['RCP', 'EMP', 'SFEMP', 'AIN', ]
        let params = await this.storage.get(this.config.GET_FILE('params'));
        var credit = parseFloat(account.creditdisponible);
        var balance = parseFloat(account.balance);
        var cache = 0.00;
        trans.forEach((tr)=>{
          let pcode = (params.find((s) => s.id == tr.parameterid)).code;
          if(credittypes.includes(pcode)){
            credit += parseFloat(tr.amount);
            balance += parseFloat(tr.amount);
            cache += parseFloat(tr.amount);
          }else if(debittypes.includes(pcode)){
            credit -= parseFloat(tr.amount);
            balance -= parseFloat(tr.amount);
            cache -= parseFloat(tr.amount);
          }
        })
        this.new_credit = credit;
        this.new_balance = balance;
        this.new_cashbox = cache;
      })
  }

  async deleleTransaction(tr: any){
    const alert = await this.alertCtrl.create({
      header: 'Are you sure?',
      buttons: [
        {
          text: 'No',
        },
        {
          text: 'Yes',
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
  }

  async addTransactionModal(event: Event, account: any) {
    const modal = await this.modalCtrl.create({
      component: TransactionsComponent,
      componentProps: {account: account}
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      // refresh accounts totals
      this.load_accounts();
    }
  }

  async showAccountInfo(account){
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
