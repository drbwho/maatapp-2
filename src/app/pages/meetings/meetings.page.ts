import { Component, OnInit } from '@angular/core';
import { DataProvider } from '../../providers/provider-data';
import { NavController } from '@ionic/angular';
import { AppComponent } from '../../app.component';
import { ConfigData } from '../../providers/config-data';
import { Storage } from '@ionic/storage-angular';

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

  constructor(
    private dataProvider: DataProvider,
    private navCtrl: NavController,
    private appcomponent: AppComponent,
    private storage: Storage,
    private config: ConfigData
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
      this.lastmeeting = current.group.lastmeeting;
      this.meeting_status = await this.appcomponent.get_meeting_status(this.lastmeeting);
      this.meetings = [];
    }
  }

  show_all_meetings(){
    this.dataProvider.fetch_data('meetings', this.group.id, true, true).then(async (data: any)=> {
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
    });
  }

}
