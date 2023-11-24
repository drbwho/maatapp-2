import { AfterViewInit, Component } from '@angular/core';
import { NavParams } from '@ionic/angular';

@Component({
  selector: 'app-select-meeting',
  templateUrl: './select-meeting.html',
  styleUrls: ['./select-meeting.scss'],
})
export class SelectMeetingPage implements AfterViewInit {

  meetings:[]=[];

  constructor(private navParams: NavParams) { }

  ngAfterViewInit() {
    const meetings = this.navParams.get('excludedTracks');
    this.meetings = meetings;
  }

}
