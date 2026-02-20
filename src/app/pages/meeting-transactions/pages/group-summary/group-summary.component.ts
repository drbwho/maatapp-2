import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-group-summary',
  templateUrl: './group-summary.component.html',
  styleUrls: ['./group-summary.component.scss'],
  standalone: false
})
export class GroupSummaryComponent  implements OnInit {
  @Input() group: any;
  @Input() accounts: any;
  duetoday = 0;
  pending = 0;
  completing = 0;

  constructor() { }

  ngOnInit() {
    const todayStr = new Date().toDateString();
    this.duetoday = this.accounts.filter((s) => {s.dateecheance && new Date(s.dateecheance).toDateString() === todayStr}).length;
    this.pending = this.accounts.filter((s)=> s.due > 0).length;
    this.completing  = this.accounts.filter((s)=> s.emprunts > 0).length - this.group.numloans;
  }

}
