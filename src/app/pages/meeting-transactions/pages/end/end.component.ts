import { Component, OnInit, Input } from '@angular/core';
import { OperationTools } from '../../../../providers/operation-tools';
import { GroupTools } from '../../../../providers/group-tools';

@Component({
  selector: 'app-end',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss'],
  standalone: false
})
export class EndComponent  implements OnInit {
  @Input() group: any;
  @Input() accounts: any;
  @Input() country: any;
  @Input() meeting: any;
  loans_completed = 0;
  loans_to_due = 0;
  show_max = false;
  max_loans = 0;
  max_collection = 0;

  constructor(
    private operTools: OperationTools,
    private groupTools: GroupTools
  ) { }

  ngOnInit() {
    this.calc_views();
  }

  async calc_views(){
    const today = new Date();
    
    this.accounts.forEach(async acc => {
      // cals loans completed
      let totals = await this.operTools.estimate_meeting_totals(acc, this.meeting.id);
      if(totals.transactions.get('REM') && parseFloat(totals.transactions.get('REM')) >= parseFloat(acc.restearembourser)){
        this.loans_completed++;
      }
      //calc loans dues
      const givenDate = new Date(acc.dateecheance);
      const diffInMs = givenDate.getTime() - today.getTime();
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      if(diffInDays < 7){
        this.loans_to_due++;
      }
    });

    let meetings: any = await this.groupTools.get_meetings(this.group);
    meetings = meetings.filter(m => m.id != this.meeting.id);
    this.max_loans = Math.max(...meetings.map(meeting => meeting.loans));
    this.max_collection = Math.max(...meetings.map(meeting => meeting.collection));
  }

}
