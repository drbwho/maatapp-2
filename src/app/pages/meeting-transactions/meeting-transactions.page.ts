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
import { TranslateService } from '@ngx-translate/core';
import { ContributionsComponent } from './pages/contributions/contributions.component';
import { BalanceComponent } from './pages/balance/balance.component';

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
  group: any;
  groupid: string;
  meeting: any;
  country: any;
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
  params: any;
  buttonText: string;
  pageIndex = 0;

   readonly componentMap = {
      1: {component: GroupSummaryComponent, button: 'confirm_attendance'},
      2: {component: AttendanceComponent, button: 'contributions'},
      3: {component: ContributionsComponent, button: 'balance'},
      4: {component: BalanceComponent, button: 'proceed_to_maats'},
      5: {component: MaatsComponent, button: 'continue'},
      6: {component: SettlementComponent, button: 'our_group'},
      7: {component: GroupReviewComponent, button: 'continue'},
      8: {component: CloseComponent, button: 'close_meeting'}
    };

  constructor(
    private dataProvider: DataProvider,
    private operTools: OperationTools,
    private translate: TranslateService
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
    this.num_ECP = await this.operTools.get_num_of_ECP(this.meeting, this.country.id);
    this.new_totals = await this.operTools.estimate_meeting_totals(null, this.meeting.id);

    this.dataProvider.fetch_data('accounts', this.group.id, true, true).then(async (data: any)=> {
      this.accounts = data.filter((s)=> s.statut == 0 && s.type == 1); //active accounts & member acounts
      this.nextPage();
    });
  }

  nextPage(){
    this.pageIndex++;
    this.gotoPage();
  }

  previousPage(){
    this.pageIndex--;
    if(this.pageIndex < 0){ this.pageIndex = 0}
    this.gotoPage();
  }

  gotoPage(){
    this.translate.get(this.componentMap[this.pageIndex].button).subscribe((key)=>{
      this.buttonText = key;
      this.params = {group: this.group, accounts: this.accounts, meeting: this.meeting, country: this.country};
      this.transactionsPageComponent = this.componentMap[this.pageIndex].component;
    });
  }

}
