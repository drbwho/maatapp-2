import { Component, Input, OnInit, computed, signal } from '@angular/core';

@Component({
  selector: 'app-meeting-card',
  templateUrl: './meeting-card.component.html',
  styleUrls: ['./meeting-card.component.scss'],
  standalone: false
})
export class MeetingCardComponent  implements OnInit {
  //Use Setter and signal to compute values
  @Input() attendance: string = '';
  @Input() collectedValue?: string;
  @Input() set meeting(value: any) {
    this.meeting$.set(value);
  }
  public meeting$ = signal<any>(null);

  status = computed(() => { 
      if(this.meeting$()?.endedat){
        if(this.meeting$()?.haspending){
          return 'closed-pending';
        }else{
          return 'closed';
        }
      }
      return  'progress';
    });
  fullDate = computed(() => this.meeting$()?.endedat ? this.meeting$()?.endedat : this.meeting$()?.startedat);

  constructor() {}

  ngOnInit() {
  }

}

