import { Component, OnInit } from '@angular/core';
import { DataProvider } from '../../providers/provider-data';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { TransactionsComponent } from '../../component/transactions/transactions.component';
import { Events } from '../../providers/events';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';

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
      this.accounts = data.filter((s)=> s.type == 1 && s.statut == 0); //user accounts
      let transactions = await this.storage.get(this.config.TRANSACTIONS_FILE);
      // load pending transactions for each account 
      this.accounts.forEach((acc) => {
        acc.transactions = transactions.filter((s)=>s.accountid == acc.id && s.meetingid == this.meeting.id);
      });
    });
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

  async presentModal(event: Event, account: any) {
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

}
