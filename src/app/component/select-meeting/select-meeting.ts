import { AfterViewInit, Component } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ModalController } from '@ionic/angular';
import { ConferenceData } from '../../providers/conference-data';
import { ConfigData } from '../../providers/config-data';

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
    private config: ConfigData
  ) { }

  ngAfterViewInit() {
    this.confData.load_meetings().then((data: any)=>{
      this.meetings = data;
      this.storage.get(this.config.CUR_MEETING).then((data)=>{
        this.curmeeting = data;
      });
    });
  }

  selectMeeting(meeting: any){
    this.storage.set(this.config.CUR_MEETING, meeting);
    this.modalCtrl.dismiss();
  }

  close(){
    this.modalCtrl.dismiss();
  }

}
