import { Component, OnInit } from '@angular/core';
import { DataProvider } from '../../providers/provider-data';
import { NavController } from '@ionic/angular';
import { GroupTools } from '../../providers/group-tools';
import { TranslateService } from '@ngx-translate/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { ActionViewComponent } from '../../component/action-view/action-view.component';

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.page.html',
  styleUrls: ['./meetings.page.scss'],
  standalone: false
})
export class MeetingsPage implements OnInit {
  group = {id:"", name:"", ville:""}
  country = {id:"", name:"", currency:"", flagcode:"gb"};
  lastmeeting: any = {};
  meeting_status = "";
  meetings = [];
  show_all = false;

  constructor(
    private dataProvider: DataProvider,
    private navCtrl: NavController,
    private groupTools: GroupTools,
    private translate: TranslateService,
    private actionSheetCtrl: ActionSheetController,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.load_currents();
  }

  async load_currents(){
    var current = await this.dataProvider.getCurrent();
    if(!current || current.country == undefined){
      this.navCtrl.navigateForward('/countries');
    }else if(!current.group){
      this.navCtrl.navigateForward('/country/' + current.country.id + '/groups');
    }else {
      this.country = current.country;
      this.group = current.group;
      this.meetings = await this.groupTools.get_meetings(this.group);
      this.lastmeeting = this.groupTools.get_last_meeting(this.meetings);
      this.meeting_status = await this.groupTools.get_meeting_status(this.meetings, this.group.id);
    }
  }

  async openOptions(meeting) {
    this.translate.get(['upload_data','view_transactions', 'cancel']).subscribe(async (keys: any)=>{
      let buttons = [];
      if(meeting.pending || meeting.haspending){
        buttons.push({
          text: keys['upload_data'],
          icon: 'cloud-upload',
          cssClass:'action-sheet-primary',
          handler: () => {

          },
        });
      }
      buttons.push({
          text: keys['view_transactions'],
          icon: 'stats-chart',
          handler: () => {
            this.open_details(meeting);
          },
        },
        {
          text: keys['cancel'],
          role: 'cancel',
          icon: 'close-outline'
        });

      const actionSheet = await this.actionSheetCtrl.create({
        header: meeting.place,
        cssClass: 'settings-action-sheet ion-padding',
        buttons: buttons
      });
      await actionSheet.present();
    })
  }

  show_all_meetings(){
    /*this.dataProvider.fetch_data('meetings', this.group.id, true, true).then(async (data: any)=> {
      // merge with local stored new meetings
      var newmeetings = await this.storage.get(this.config.NEWMEETINS_FILE);
      if(newmeetings != null && newmeetings.length){
        newmeetings = newmeetings.filter(s => s.idgroup == this.group.id);
        this.meetings = [...newmeetings, ...data];
      }else{
        // filter already loaded lastmeeting
        this.meetings = data;//.filter((a) => a.id != this.lastmeeting.id);
      }
      //check if meeting has pending transactions to upload
      this.meetings.forEach((m)=>{
        m.haspending = 0;
        this.storage.get(this.config.TRANSACTIONS_FILE).then((trns)=>{
          if(trns && (trns.filter(s => s.meetingid == m.id)).length){
            m.haspending = (trns.filter(s => s.meetingid == m.id)).length;
          }
        });
      })
    });*/
    this.show_all = true;
  }

  async open_details(meeting: any){
    this.dataProvider.current.meeting = meeting;
    let meet_status = '';
    if(meeting.pending || meeting.haspending){
      meet_status = 'upload-close';
    }else{
      meet_status = 'great';
    }

    let keys = ['messages.meetings.'+ meet_status +'.heading', 'messages.meetings.'+ meet_status +'.description', 'messages.meetings.'+ meet_status +'.button'];
    if(meet_status == 'upload-close'){
      keys.push('messages.meetings.'+ meet_status +'.button_1');
    }
    this.translate.get(keys).subscribe(async (keys)=>{
      let buttons = [];
      switch(meet_status){
        case 'upload-close':
          buttons.push(
            {text: keys['messages.meetings.'+ meet_status +'.button'], color: 'primary', action:'upload'});
          if(!meeting.endedat){
            buttons.push({text: keys['messages.meetings.'+ meet_status +'.button_1'], color: 'light', action:'close'});
          }
          break;
        default:
           buttons.push({text: keys['messages.meetings.'+ meet_status +'.button'], color: 'primary', action:'view'});
           break;
      }
      const modal = await this.modalCtrl.create({
        component: ActionViewComponent,
        componentProps: {
          alttitle: meeting.place,
          heading: keys['messages.meetings.'+ meet_status +'.heading'],
          description: keys['messages.meetings.'+ meet_status +'.description'],
          image: 'assets/img/action-views/'+ meet_status +'-meeting.png',
          hasBackButton: true,
          buttons: buttons
        },
        cssClass: ''
      });
      await modal.present();
      await modal.onWillDismiss().then((data)=>{
        //this.router.navigate(['/meeting-history'], {state: {direction: 'forward'}}); return;
        if(data.data!='close'){
          this.navCtrl.navigateForward('/meeting-history');
        }
      });
      return;
    });
  }

}
