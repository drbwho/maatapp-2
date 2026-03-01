import { Component, Input, OnInit, computed, signal } from '@angular/core';
import { DataProvider } from '../../providers/provider-data';

@Component({
  selector: 'app-meeting-card',
  templateUrl: './meeting-card.component.html',
  styleUrls: ['./meeting-card.component.scss'],
  standalone: false
})
export class MeetingCardComponent  implements OnInit {
  //Use Setter and signal to compute values
  @Input() attendance: string = '';
  @Input() group?: any = null;
  @Input() set meeting(value: any) {
    this.meeting$.set(value);
  }
  public meeting$ = signal<any>(null);

  status = computed(() => {
    if(this.meeting$()?.endedat){
      return 'closed' + (this.meeting$()?.haspending || this.meeting$()?.pending ? '-pending' : '');
    }
    return  'progress' + (this.meeting$()?.haspending || this.meeting$()?.pending ? '-pending' : '');
  });
  fullDate = computed(() => this.meeting$()?.endedat ? this.meeting$()?.endedat : this.meeting$()?.startedat);

  constructor(
  ) {}

  ngOnInit() {
  }

}

