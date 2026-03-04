import { Component, OnInit } from '@angular/core';
import { DataProvider, Meeting } from '../../providers/provider-data';
import { NavController } from '@ionic/angular';
import { GroupTools } from '../../providers/group-tools';
import { TranslateService } from '@ngx-translate/core';
import { ActionSheetController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { MeetingsActionViews } from './meetings.action-views';
@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.page.html',
  styleUrls: ['./meetings.page.scss'],
  standalone: false
})
export class MeetingsPage implements OnInit {
  group = {id:"", name:"", ville:"", numberofmembers: 0}
  country = {id:"", name:"", currency:"", flagcode:"gb"};
  lastmeeting: any = {};
  meeting_status = "";
  meetings: Meeting[] = [];
  show_all = false;

  constructor(
    private dataProvider: DataProvider,
    private navCtrl: NavController,
    private groupTools: GroupTools,
    private translate: TranslateService,
    private actionSheetCtrl: ActionSheetController,
    private route: ActivatedRoute,
    private meetActionViews: MeetingsActionViews
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.load_currents().then(()=>{
      // has action?
      const path = this.route.snapshot.pathFromRoot
        .map(v => v.url.map(segment => segment.path).join('/'))
        .join('/');
      if (path.includes('close')) {
        this.show_action_view(null, 'upload-close');
      }
    });
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
      this.lastmeeting = await this.groupTools.get_last_meeting(this.meetings);
      this.meeting_status = await this.groupTools.get_group_meeting_status(this.meetings, this.group.id);
      this.meetings.forEach(m =>{
        m.attendance = this.group.numberofmembers - (m.absences ? m.absences.length : 0);
      })
    }
  }

  /*
  * Options Action Sheet
  *
  */
  async openOptions(meeting: Meeting) {
    this.translate.get(['continue_meeting','upload_data','close_meeting', 'view_transactions', 'download_excel', 'cancel_meeting', 'return']).subscribe(async (keys: any)=>{
      let buttons = [];
      if(!meeting.endedat){
        buttons.push({
          text: keys['continue_meeting'],
          icon: 'caret-forward-outline',
          cssClass:'action-sheet-primary',
          handler: () => {
            this.dataProvider.current.meeting = meeting;
            this.navCtrl.navigateForward('/meeting-transactions');
          },
        });
      }
      if(meeting.pending || meeting.haspending){
        buttons.push({
          text: keys['upload_data'],
          icon: 'cloud-upload',
          cssClass: meeting.endedat ? 'action-sheet-primary' : '',
          handler: () => {
            this.show_action_view(meeting, 'upload-close');
          },
        });
      }
      if(!meeting.endedat){
        buttons.push({
          text: keys['close_meeting'],
          icon: 'pause',
          handler: () => {
            this.show_action_view(meeting, 'upload-close');
          },
        });
      }
      buttons.push({
        text: keys['view_transactions'],
        icon: 'stats-chart',
        handler: () => {
          this.show_action_view(meeting, 'view-transactions');
        },
      });
      if(meeting.endedat){
        buttons.push({
          text: keys['download_excel'],
          icon: 'assets/img/icons/excel-icon.svg',
          handler: () => {
            
          },
        });
      }
      if(meeting.pending){
        buttons.push({
          text: keys['cancel_meeting'],
          icon: 'close-circle',
          role: 'destructive',
          handler: () => {
            this.show_action_view(meeting, 'cancel');
          }
        });
      }
      buttons.push({
        text: keys['return'],
        role: 'cancel',
        icon: 'chevron-back'
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
          if(trns && (trns.filter(s => s.idmeeting == m.id)).length){
            m.haspending = (trns.filter(s => s.idmeeting == m.id)).length;
          }
        });
      })
    });*/
    this.show_all = true;
  }


  /*
  * Show Meetings Action Views
  *
  */
  async show_action_view(meeting: Meeting, action: string){
    if(!meeting){
      meeting = this.dataProvider.current.meeting;
    }
    switch(action){
      //--- upload or close meeting
      case 'upload-close':
        if(meeting.pending || meeting.haspending){
            this.meetActionViews.show_action_upload_close(meeting).then(async (res: any)=>{
            if(res.success){
              if(res.action == 'upload'){ // return from uploading
                // upload succeed
                this.meetActionViews.show_action_upload_success(meeting).then((res: any)=>{
                  if(res.action == 'history'){
                    this.dataProvider.current.meeting = meeting;
                    this.navCtrl.navigateForward('/meeting-history');
                  }
                });
              }
              this.load_currents();
              this.navCtrl.navigateRoot('/app/tabs/meetings');
            }else{
              // upload failed
              this.meetActionViews.show_action_upload_failed(meeting).then(async (res: any) =>{
                if(res.action == 'tryagain'){
                  this.navCtrl.navigateRoot('/app/tabs/meetings/close');
                }else{
                  this.navCtrl.navigateRoot('/app/tabs/meetings');
                }
              })
            }
          });
        }else{
          this.meetActionViews.show_action_upload_success(meeting).then(async (res: any)=>{
            if(res.action == 'history'){
              this.dataProvider.current.meeting = meeting;
              this.navCtrl.navigateForward('/meeting-history');
            }
            this.load_currents();
            this.navCtrl.navigateRoot('/app/tabs/meetings');
          });
        }
        break;
      //--- View meeting's transactions
      case 'view-transactions':
        let meet_status = '';
        if(meeting.pending || meeting.haspending){
          meet_status = 'upload-close';
        }else{
          meet_status = 'great';
        }
        this.meetActionViews.show_action_view_transactions(meeting, meet_status).then(data =>{
          if(data!='close'){
            this.dataProvider.current.meeting = meeting;
            this.navCtrl.navigateForward('/meeting-history');
          }
        });
        break;
      //--- cancel/suspend meeting
      case 'cancel':
        this.meetActionViews.show_action_cancel(meeting).then(async (res: any)=>{
          if(res.success){
            this.load_currents();
            this.navCtrl.navigateRoot('/app/tabs/meetings');
          }
        });
        break;
    }

  }

}
