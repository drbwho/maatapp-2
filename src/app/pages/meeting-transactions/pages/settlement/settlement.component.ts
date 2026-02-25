import { Component, OnInit, Input } from '@angular/core';
import { OperationTools } from '../../../../providers/operation-tools';

@Component({
  selector: 'app-settlement',
  templateUrl: './settlement.component.html',
  styleUrls: ['./settlement.component.scss'],
  standalone: false
})
export class SettlementComponent  implements OnInit {
  @Input() group: any;
  @Input() accounts: any;
  @Input() country: any;
  @Input() meeting: any;
  attendance = 0;
  numberofmembers = 0;

  constructor(
    private operTools: OperationTools
  ) { }

  async ngOnInit() {
    this.numberofmembers = this.group.numberofmembers;
    this.accounts = this.accounts.filter(m => m.isPresent);
    this.attendance = this.accounts.length;
    this.accounts.forEach(async acc => {
      acc.show_details = false;
      acc.totals = await this.operTools.estimate_meeting_totals(acc, this.meeting.id);
    });
    this.group.totals = await this.operTools.estimate_meeting_totals(null, this.meeting.id);
  }


}
