import { Component, Input, OnInit, computed, signal, input, effect, ChangeDetectionStrategy } from '@angular/core';
import { DataProvider, Meeting } from '../../providers/provider-data';

@Component({
  selector: 'app-meeting-card',
  templateUrl: './meeting-card.component.html',
  styleUrls: ['./meeting-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class MeetingCardComponent  implements OnInit {
  @Input() attendance: string = '';
  @Input() group?: any = null;
  @Input() meeting?: any = null;
 
  constructor(
  ) {}

  ngOnInit() {
  }

  status(){
    if(this.meeting.endedat){ 
      return 'closed' + ((this.meeting.haspending || this.meeting.pending) ? '-pending' : '');
    }
    return  'progress' + ((this.meeting.haspending || this.meeting.pending) ? '-pending' : '');
  }

  fullDate(){
    return this.meeting?.endedat ? this.meeting?.endedat : this.meeting?.startedat;
  }
}

