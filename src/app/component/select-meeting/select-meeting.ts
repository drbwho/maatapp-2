import { AfterViewInit, Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ModalController } from '@ionic/angular';
import { ConferenceData } from '../../providers/conference-data';
import { ConfigData } from '../../providers/config-data';
import { Events } from '../../providers/events';

@Component({
  selector: 'app-select-meeting',
  templateUrl: './select-meeting.html',
  styleUrls: ['./select-meeting.scss'],
})
export class SelectMeetingPage implements AfterViewInit {

  meetings:[]=[];
  curmeeting = {id:0};

  constructor(
    private storage: Storage,
    private modalCtrl: ModalController,
    private confData: ConferenceData,
    private config: ConfigData,
    private events: Events
  ) { }

  ngAfterViewInit() {
    this.confData.load_meetings(true).then((data: any)=>{
      this.meetings = data;
      this.storage.get(this.config.CUR_MEETING).then((data)=>{
        this.curmeeting = data;
      });
    });
  }

  selectMeeting(meeting: any){
    this.storage.set(this.config.CUR_MEETING, meeting).then(()=>{
      //remove meeting data
      this.confData.clearMeeting();
      this.events.publish('meeting:updated');
      this.modalCtrl.dismiss();
    });
  }

  close(){
    this.modalCtrl.dismiss();
  }

}
