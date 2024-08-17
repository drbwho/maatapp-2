import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataProvider } from '../../providers/provider-data';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';
import { AlertController, ModalController } from '@ionic/angular';
import { Network } from '@capacitor/network';
import { AccountInfoComponent } from '../../component/account-info/account-info.component';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.page.html',
  styleUrls: ['./group-details.page.scss'],
})
export class GroupDetailsPage implements OnInit {
  segment = "reunions";
  groupname: string;
  countryname: string;
  countryid: string;
  currency: string;
  group: any;
  groupId: any;
  meetings: any;
  accounts: any;
  allmeetings: any;
  allaccounts: any;
  queryText: string;

  constructor(
    private dataProvider: DataProvider,
    private route: ActivatedRoute,
    private router: Router,
    private storage: Storage,
    private config: ConfigData,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.groupId = this.route.snapshot.paramMap.get('groupId');

    this.group = this.dataProvider.current.group;
    this.groupname = this.dataProvider.current.group.name;
    this.countryname = this.dataProvider.current.country.name;
    this.countryid = this.dataProvider.current.country.id;
    this.currency = this.dataProvider.current.country.currency;

    this.update_meetings();
    this.update_accounts();
  }

  update_accounts(){
    this.dataProvider.fetch_data('accounts', this.groupId, true).then((data: any)=> {
      this.accounts = data;
      this.allaccounts = data;
    });
  }

  update_meetings(){
    this.dataProvider.fetch_data('meetings', this.groupId, true).then((data: any)=> {
      this.meetings = data;
      this.allmeetings = data;
      //check if meeting has pending transactions to upload
      this.meetings.forEach((m)=>{
        m.haspending = false;
        this.storage.get(this.config.TRANSACTIONS_FILE).then((trns)=>{
          if(trns && (trns.filter(s => s.meetingid == m.id)).length){
            m.haspending = true;
          }
        });
      })
    });
  }

  navto(meeting: any){
    this.dataProvider.current.meeting = meeting;
    this.router.navigate(['/app/tabs/meetings/'+ meeting.id], {state: {}});
  }

  searcher(){
    if(this.segment == 'reunions'){
      this.search_meetings();
    }else{
      this.search_accounts();
    }
  }

  search_meetings(){
    if(this.queryText == ''){
        this.meetings = this.allmeetings;
      return;
    }

    let queryText = this.queryText.toLowerCase().replace(/,|\.|-/g, ' ');
    const queryWords = queryText.split(' ').filter(w => !!w.trim().length);

    this.meetings = [];
    this.allmeetings.forEach((gr: any) => {
      if (queryWords.length) {
        queryWords.forEach((queryWord: string) => {
          if (gr.place.toLowerCase().indexOf(queryWord) > -1) {
            this.meetings.push(gr);
          }
        });
      }
    });
  }

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

  async showAccountInfo(account){
    const modal = await this.modalCtrl.create({
      component: AccountInfoComponent,
      componentProps: {'account': account, 'currency': this.currency}
    });
    modal.present();

    await modal.onWillDismiss();
  }

  async closeAccount(account){
    const alert = await this.alertCtrl.create({
      header: 'Are you sure to close user account?',
      buttons: [
        {
          text: 'No',
        },
        {
          text: 'Yes',
          handler: () => {
            this.dataProvider.closeUserAccount(account).then(()=>{
              this.update_accounts();
            })
          },
        },
      ],
    });
    await alert.present();  
  }

  async cancelMeeting(meetingid){
    const alert = await this.alertCtrl.create({
      header: 'Are you sure to cancel the meeting?',
      buttons: [
        {
          text: 'No',
        },
        {
          text: 'Yes',
          handler: () => {
            this.dataProvider.cancelMeeting(meetingid).then(()=>{
              this.update_meetings();
            })
          },
        },
      ],
    });
    await alert.present();  
  }

  async uploadMeeting(meeting: any){
    let net = await Network.getStatus();
    if(!net.connected){
      const alert = await this.alertCtrl.create({
        header: "Error",
        message: 'There is no network connection!<br/>Please try again later',
        buttons: [
          {
            text: 'Ok',
          },
        ],
      });
      await alert.present();
      return;
    }
    //upload all pending meeting transactions
    this.dataProvider.uloadOperations(meeting.id).then(async (res:any) => {
      let header="";
      let message="";
      if(res.status.toLowerCase() == 'error'){
        header = "Error";
        message = res.message;
      }else{
        header = "Success";
        message = "Operations uploaded";
        this.update_meetings();
        this.update_accounts();
      }
      const alert = await this.alertCtrl.create({
        header: header,
        message: message,
        buttons: [
          {
            text: 'Ok',
          },
        ],
      });
      await alert.present();
    })
  }

}
