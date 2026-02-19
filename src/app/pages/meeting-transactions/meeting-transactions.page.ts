import { Component, OnInit } from '@angular/core';

import { AttendanceComponent } from './pages/attendance/attendance.component';
import { CloseComponent } from './pages/close/close.component';
import { GroupReviewComponent } from './pages/group-review/group-review.component';
import { GroupSummaryComponent } from './pages/group-summary/group-summary.component';
import { MaatsComponent } from './pages/maats/maats.component';
import { MemberComponent } from './pages/member/member.component';
import { SettlementComponent } from './pages/settlement/settlement.component';
import { MeetingTotals } from '../../interfaces/data-interfaces';
import { DataProvider } from '../../providers/provider-data';
import { OperationTools } from '../../providers/operation-tools';

@Component({
  selector: 'app-meeting-transactions',
  templateUrl: './meeting-transactions.page.html',
  styleUrls: ['./meeting-transactions.page.scss'],
  standalone: false
})
export class MeetingTransactionsPage implements OnInit {
  transactionsPageComponent = null;
  meetingplace: string;
  meetingdate: string;
  groupname: string;
  currency: string;
  country: any = {flagcode: 'gb'};
  group: any;
  groupid: string;
  meeting: any;
  allaccounts: any;
  accounts: any;
  status: string;
  fullDate: string;
  num_ECP = 0;
  new_totals: MeetingTotals = {
    cash: 0.00,
    balance: 0.00,
    credit: 0.00,
    loans: 0.00
  }

  constructor(
    private dataProvider: DataProvider,
    private operTools: OperationTools
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter(){
    this.meeting = this.dataProvider.current.meeting;
    this.meetingplace = this.meeting.place;
    this.meetingdate = this.meeting.startedat;
    this.group = this.dataProvider.current.group;
    this.groupname = this.group.name;
    this.groupid = this.group.id;
    this.country = this.dataProvider.current.country;
    this.currency = this.country.currency;
    this.num_ECP = await this.operTools.get_num_of_ECP(this.meeting, this.country.id);
    this.new_totals = await this.operTools.estimate_meeting_totals(null, this.meeting.id);


    this.transactionsPageComponent = GroupSummaryComponent;
  }

}
