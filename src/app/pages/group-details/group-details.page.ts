import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataProvider } from '../../providers/provider-data';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';
import { AlertController, ModalController } from '@ionic/angular';
import { Network } from '@capacitor/network';
import { AccountInfoComponent } from '../../component/account-info/account-info.component';
import { UserData } from '../../providers/user-data';
import { MeetingFormComponent } from '../../component/meeting-form/meeting-form.component';
import { HistoryComponent } from '../../component/history/history.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-group-details',
    templateUrl: './group-details.page.html',
    styleUrls: ['./group-details.page.scss'],
    standalone: false
})
export class GroupDetailsPage implements OnInit {
  segment = "reunions";
  groupname: string;
  grouptype: any;
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
  userRole: any;
  searchPlaceholder: string;

  constructor(
    private dataProvider: DataProvider,
    private route: ActivatedRoute,
    private router: Router,
    private storage: Storage,
    private config: ConfigData,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private user: UserData,
    private translate: TranslateService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.groupId = this.route.snapshot.paramMap.get('groupId');

    this.group = this.dataProvider.current.group;
    this.groupname = this.dataProvider.current.group.name;
    this.grouptype = this.dataProvider.current.group.type;
    this.countryname = this.dataProvider.current.country.name;
    this.countryid = this.dataProvider.current.country.id;
    this.currency = this.dataProvider.current.country.currency;

    this.user.getUser().then(res => this.userRole = res.role);
    this.update_meetings();
    this.update_accounts();

    //If its a direction group go to accounts tab
    if(this.grouptype == 0){
      this.segment = "comptes";
    }

    this.translate.get('search').subscribe((keys:any)=>{
      this.searchPlaceholder = keys;
    })
  }

  update_accounts(){
    this.dataProvider.fetch_data('accounts', this.groupId, true, true).then((data: any)=> {
      data.forEach((a)=>{
        a.loans_expired = false;
        if(a.dateecheance != null && (new Date(a.dateecheance) < (new Date())) && parseFloat(a.restearembourser) > 0){
          a.loans_expired = true;
        }
        a.sfloans_expired = false;
        if( a.dateecheance != null && (new Date(a.sfdateecheance) < (new Date())) && parseFloat(a.sfrestearembourser) > 0){
          a.sfloans_expired = true;
        }
      })
;      this.accounts = data;
      this.allaccounts = data;
    });
  }

  update_meetings(){
    this.dataProvider.fetch_data('meetings', this.groupId, true, true).then(async (data: any)=> {
      // merge with local stored new meetings
      var newmeetings = await this.storage.get(this.config.NEWMEETINS_FILE);
      if(newmeetings != null && newmeetings.length){
        newmeetings = newmeetings.filter(s => s.idgroup == this.groupId);
        this.meetings = [...newmeetings, ...data];
      }else{
        this.meetings = data;
      }
      this.allmeetings = this.meetings;
      //check if meeting has pending transactions to upload
      this.meetings.forEach((m)=>{
        m.haspending = 0;
        this.storage.get(this.config.TRANSACTIONS_FILE).then((trns)=>{
          if(trns && (trns.filter(s => s.meetingid == m.id)).length){
            m.haspending = (trns.filter(s => s.meetingid == m.id)).length;
          }
        });
      })
    });
  }

  showTransactions(meeting: any){
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
      componentProps: {'account': account, 'currency': this.currency, 'show_transactions': true}
    });
    modal.present();

    await modal.onWillDismiss();
  }

  async closeAccount(account){
    this.translate.get(['confirmation','are_you_sure_to_close_user_account','no','yes']).subscribe(async (keys: any)=>{
      const delaySeconds = 10; // Yes delay
      let countdown = delaySeconds;

      const alert = await this.alertCtrl.create({
        header: keys['confirmation'],
        message: keys['are_you_sure_to_close_user_account'],
        buttons: [
        {
          text: keys['no']
        },
        {
          text: keys['yes'],
          handler: () => {
            this.dataProvider.closeUserAccount(account).then(()=>{
              this.update_accounts();
            })
          },
        },
        ],
      });
      await alert.present();

      // Disable Yes button
      const yesButton = document.querySelector(
        'ion-alert button:nth-child(2)'
      ) as HTMLButtonElement;
      if (yesButton){
        yesButton.disabled = true;
        yesButton.style.color = '#ccc';
      }

      // Countdown timer
      const interval = setInterval(() => {
        countdown--;
        if (yesButton) yesButton.textContent = countdown > 0 ? keys['yes'] +` (${countdown})` : keys['yes'];

        if (countdown <= 0) {
          if (yesButton) yesButton.disabled = false;
          yesButton.style.color = '';
          clearInterval(interval);
        }
      }, 1000);
    });
  }

  async cancelMeeting(meeting){
    this.translate.get(['confirmation','are_you_sure_to_cancel_the_meeting','no','yes']).subscribe(async (keys: any)=>{
      const alert = await this.alertCtrl.create({
        header: keys['confirmation'],
        message: keys['are_you_sure_to_cancel_the_meeting'],
        buttons: [
        {
          text: keys['no'],
        },
        {
          text: keys['yes'],
          handler: () => {
            this.dataProvider.cancelMeeting(meeting).then((res)=>{
              this.update_meetings();
            })
          },
        },
        ],
      });
      await alert.present();
    });
  }

  async closeMeeting(meeting){
    this.translate.get(['confirmation','are_you_sure_to_close_the_meeting','no','yes','error']).subscribe(async (keys: any)=>{
      const alert = await this.alertCtrl.create({
        header: keys['confirmation'],
        message: keys['are_you_sure_to_close_the_meeting'],
        buttons: [
        {
          text: keys['no'],
        },
        {
          text: keys['yes'],
          handler: () => {
            this.dataProvider.closeMeeting(meeting).then(async (res: any)=>{
              if(res.status != undefined && res.status == 'error'){
                const alert = await this.alertCtrl.create({
                  header: keys['error'],
                  message: res.message,
                  buttons: [
                    {
                      text: 'Ok',
                    },
                  ],
                });
                await alert.present();
                return;
              }
              this.update_meetings();
            })
          },
        },
        ],
      });
      await alert.present();
    });
  }


  async confirmUploadMeeting(meeting){
    this.translate.get(['confirmation','are_you_sure_to_upload_transactions','no','yes']).subscribe(async (keys: any)=>{
      const alert = await this.alertCtrl.create({
        header: keys['confirmation'],
        message: keys['are_you_sure_to_upload_transactions'],
        buttons: [
        {
          text: keys['no']
        },
        {
          text: keys['yes'],
          handler: () => {
            this.uploadMeeting(meeting);
          },
        },
        ],
      });
      await alert.present();
    });
  }

  async uploadMeeting(meeting: any){
    let net = await Network.getStatus();
    if(!net.connected){
      this.translate.get(['no_network','error']).subscribe(async (keys: any)=>{
        const alert = await this.alertCtrl.create({
          header: keys['error'],
          message: keys['no_network'],
          buttons: [
          {
            text: 'Ok',
          },
          ],
        });
        await alert.present();
      });
      return;
    }
    //upload all pending meeting transactions
    this.translate.get(['data_uploaded','success','error']).subscribe(async (keys: any)=>{;
      this.dataProvider.uploadOperations(meeting).then(async (res:any) => {
        let header="";
        let message="";
        if(res.status.toLowerCase() == 'error'){
          header = keys['error'];
          message = res.message;
        }else{
          header = keys['success'];
          message = keys['data_uploaded'];
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
        this.update_meetings();
        this.update_accounts();
        await alert.present();
      });
    })
  }

  async showMeetingForm() {
    //check if open meetings exists
    let open_exists = false;
    this.meetings.forEach((mt)=>{
      if((mt.endedat == null || !mt.endedat) && !mt.cancelled){
        open_exists = true;
        return;
      }
    })
    if(open_exists){
      this.translate.get(['there_is_open_meeting','error']).subscribe(async (keys: any)=>{
        const alert = await this.alertCtrl.create({
          header: keys['error'],
          message: keys['there_is_open_meeting'],
          buttons: [
          {
            text: 'Ok',
          }
          ],
        });
        await alert.present();
      });
      return;
    }

    const modal = await this.modalCtrl.create({
      component: MeetingFormComponent,
      componentProps: {group: this.group, meetings: this.meetings}
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      this.update_meetings();
    }
  }

  async openHistory(meeting: any){
    const modal = await this.modalCtrl.create({
      component: HistoryComponent,
      componentProps: {meeting: meeting}
    });
    await modal.present();
  }

  async clearPendings(meeting: any){
    //clear pending transactions or pending meeting
    if(!meeting.haspending && meeting.pending){
      this.translate.get(['confirmation','are_you_sure_to_clear_meeting','yes','no']).subscribe(async (keys: any)=>{
        const alert = await this.alertCtrl.create({
          header: keys['confirmation'],
          message: keys['are_you_sure_to_clear_meeting'],
          buttons: [
          {
            text: keys['no']
          },
          {
            text: keys['yes'],
            handler: () => {
              this.dataProvider.clearPendingOperations(meeting, true).then(()=>{
                this.update_meetings();
              });
            },
          },
          ],
        });
        await alert.present();
      });
    }else{
      this.translate.get(['confirmation','are_you_sure_to_clear_transactions','yes','no']).subscribe(async (keys: any)=>{
        const alert = await this.alertCtrl.create({
          header: keys['confirmation'],
          message: keys['are_you_sure_to_clear_transactions'],
          buttons: [
          {
            text: keys['no']
          },
          {
            text: keys['yes'],
            handler: () => {
              this.dataProvider.clearPendingOperations(meeting).then(()=>{
                this.update_meetings();
              });
            },
          },
          ],
        });
        await alert.present();
      });
    }
  }
}
