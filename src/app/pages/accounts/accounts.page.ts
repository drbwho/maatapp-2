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
import { GroupTools } from '../../providers/group-tools';
import { ActionViewComponent } from '../../component/action-view/action-view.component';

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.page.html',
    styleUrls: ['./accounts.page.scss'],
    standalone: false
})
export class AccountsPage implements OnInit {
  groupname: string;
  currency: string;
  country: any = {flagcode: 'gb'};
  group: any;
  groupid: string;
  allaccounts: any;
  accounts: any;
  status: string;
  fullDate: string;
  num_ECP = 0;
  new_totals: MeetingTotals = {
    debit: 0.00,
    balance: 0.00,
    credit: 0.00,
    loans: 0.00
  }
  selectedAll: boolean = false;
  selectedAccounts = 0;
  queryText: string = "";
  searchPlaceholder: string = "";
  public pf = parseFloat;

  constructor(
    private dataProvider: DataProvider,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private operTools: OperationTools,
    private translate: TranslateService,
    private groupTools: GroupTools
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.group = this.dataProvider.current.group;
    this.groupname = this.group?.name;
    this.groupid = this.group?.id;
    this.country = this.dataProvider.current.country;
    this.currency = this.country?.currency;
    //this.num_ECP = await this.operTools.get_num_of_ECP(this.meeting, this.country.id);
    //this.new_totals = await this.operTools.estimate_meeting_totals(null, this.meeting.id);

    //this.calc_status();
    await this.load_accounts();
    this.show_progress();
  }

  /*calc_status(){
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
  }*/

  load_accounts(){
    this.dataProvider.fetch_data('accounts', this.group.id, true, true).then(async (data: any)=> {
      this.allaccounts = data.filter((s)=> s.statut == 0 && s.type == 1); //active accounts & member acounts
      //let transactions = await this.storage.get(this.config.TRANSACTIONS_FILE);
      //let upload_errors = await this.storage.get(this.config.UPLOAD_ERRORS_FILE);

      // load pending transactions for each account
      this.allaccounts.forEach(async (acc) => {
        //if(transactions){
          //append upload errors to transactions
          /*acc.transactions = transactions.filter((s)=>s.idaccount == acc.id && s.idmeeting == this.meeting.id);
          if(upload_errors){
            acc.transactions.forEach((tr)=>{
              let uplerr = upload_errors.find((s)=> s.idmeeting == tr.idmeeting && s.idaccount == tr.idaccount && s.idparameter == tr.idparameter);
              if(uplerr){
                tr.error = uplerr.message;
              }
            });
          }
        }*/
        /*if(acc.type == 2){
          // get meeting history from api
          await this.operTools.refreshMeetingHistory(this.meeting.id);
          this.new_totals = await this.operTools.estimate_meeting_totals(acc, this.meeting.id);
        }*/
        // loan overdues

        if( acc.dateecheance != null && (new Date(acc.dateecheance) < (new Date()))){
          acc.loans_expired = true;
        }else{
          const diffInMs = Math.abs((new Date()).getTime() - (new Date(acc.dateecheance)).getTime());
          const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
          if(diffInDays < 10){
            acc.loans_to_be_expired = diffInDays;
          }
        }
        if( acc.sfdateecheance != null && (new Date(acc.sfdateecheance) < (new Date()))){
          acc.sfloans_expired = true;
        }else{
          const diffInMs = Math.abs((new Date()).getTime() - (new Date(acc.sfdateecheance)).getTime());
          const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
          if(diffInDays < 10){
            acc.sfloans_to_be_expired = diffInDays;
          }
        }

        // Calc meeting dues
        /*acc.missing_contribs = false;
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
        }*/

        // dues
        acc.status = "happy";
        if(acc.due){
          acc.status = "neutral";
        }
        if(acc.loans_expired || acc.sfloans_expired){
          acc.status = "sad";
        }
      });
      this.accounts = this.allaccounts;
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
            let index = transactions.findIndex(s => s.idaccount == tr.idaccount && s.idmeeting == tr.idmeeting && s.idparameter == tr.idparameter && s.amount == tr.amount);
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

  /*async showAccountInfo(event: Event, account){
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
      componentProps: {'account': account, 'currency': this.currency, 'show_transactions': false, 'group_totals': group_totals}
    });
    modal.present();

    await modal.onWillDismiss();
  }*/

  search_accounts(){
    if(this.queryText == ''){
      this.accounts = this.allaccounts;
      return;
    }

    let queryText = this.queryText.toLowerCase().replace(/,|\.|-/g, ' ');
    const queryWords = queryText.split(' ').filter(w => !!w.trim().length);

    this.accounts = [];
    this.allaccounts.forEach((gr: any) => {
      if (queryWords.length) {
        queryWords.forEach((queryWord: string) => {
          if (gr.owner.toLowerCase().indexOf(queryWord) > -1) {
            this.accounts.push(gr);
          }
        });
      }
    });
  }

  async show_progress(){
      let group_health: string;
      if(this.group.grouphealth >= 2.8){
        group_health = 'great';
      }else if(this.group.grouphealth >= 2.6){
        group_health = 'well';
      }else if(this.group.grouphealth >= 2.5){
        group_health = 'stable';
      }else{
        group_health = 'attention';
      }

      let lastcollection = this.group.lastmeeting.collection;

      let keys = ['messages.accounts.'+ group_health +'.heading', 'messages.accounts.'+ group_health +'.description',
        'messages.accounts.view_members_details', 'total_outstanding_maats', "since_last_meeting", "overdue",
        "members_have_pending_payments"];

      this.translate.get(keys).subscribe(async (keys)=>{
        let info: string;
        let badge: any = null;
        if(group_health == 'great' || group_health == 'well'){
          info = "<h1 class='emphassis'>"+ this.group.totals.balance +"</h1> \
            <p class='text-12 ion-no-margin'>" + keys['total_group_fund'] + "</p>";
          badge = {class: 'success', information: lastcollection + " " + keys['since_last_meeting']}
        }else if(group_health == 'stable'){
           info = "<h1 class='emphassis'>"+ this.group.numdueloans +"</h1>\
            <p class='text-12 ion-no-margin'>" + keys['members_have_pending_payments'] + "</p>";
        }else if(group_health == 'attention'){
          info = "<h1 class='ion-no-margin'>"+ this.group.totals.restearembourser +"</h1>\
            <p class='text-12 ion-no-margin'>" + keys['total_outstanding_maats'] + "</p>";
          badge = {class: 'danger', information: this.group.numdueloans + " "+ keys['overdue']} }

        const modal = await this.modalCtrl.create({
          component: ActionViewComponent,
          componentProps: {
            alttitle: this.group.name,
            heading: keys['messages.accounts.'+ group_health +'.heading'],
            description: keys['messages.accounts.'+ group_health +'.description'],
            information: info,
            badge: badge,
            image: 'assets/img/action-views/'+ group_health +'-group.png',
            hasBackButton: true,
            buttons: [{text: keys['messages.accounts.view_members_details'], color: 'primary'}]
          },
          cssClass: ''
        });
        await modal.present();
      });
    }
}

