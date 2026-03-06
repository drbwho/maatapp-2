import { Component, OnInit } from '@angular/core';

import { AttendanceComponent } from './pages/attendance/attendance.component';
import { EndComponent } from './pages/end/end.component';
import { GroupReviewComponent } from './pages/group-review/group-review.component';
import { GroupSummaryComponent } from './pages/group-summary/group-summary.component';
import { MaatsComponent } from './pages/maats/maats.component';
import { SettlementComponent } from './pages/settlement/settlement.component';

import { MeetingTotals } from '../../interfaces/data-interfaces';
import { DataProvider } from '../../providers/provider-data';
import { OperationTools } from '../../providers/operation-tools';
import { TranslateService } from '@ngx-translate/core';
import { ContributionsComponent } from './pages/contributions/contributions.component';
import { BalanceComponent } from './pages/balance/balance.component';
import { Router } from '@angular/router';

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
    debit: 0.00,
    newbalance: 0.00,
    credit: 0.00,
    loans: 0.00
  }
  params: any;
  buttonText: string;
  previousUrl = "";
  pageIndex = 0;

   readonly componentMap = {
      1: {component: GroupSummaryComponent, button: 'confirm_attendance'},
      2: {component: AttendanceComponent, button: 'contributions'},
      3: {component: ContributionsComponent, button: 'balance'},
      4: {component: BalanceComponent, button: 'proceed_to_maats'},
      5: {component: MaatsComponent, button: 'final_settlement'},
      6: {component: SettlementComponent, button: 'our_group'},
      7: {component: GroupReviewComponent, button: 'continue'},
      8: {component: EndComponent, button: 'close_meeting', action: '/app/tabs/meetings/close'}
    };

  constructor(
    private dataProvider: DataProvider,
    private operTools: OperationTools,
    private translate: TranslateService,
    private router: Router
  ) {
    const navigation = this.router.currentNavigation();
    this.previousUrl = navigation?.previousNavigation?.finalUrl?.toString();
  }

  ngOnInit() {
  }

  async ionViewWillEnter(){
    if(this.pageIndex < 1){
      this.pageIndex=1;
    }

    this.meeting = this.dataProvider.current.meeting;
    this.meetingplace = this.meeting.place;
    this.meetingdate = this.meeting.startedat;
    this.group = this.dataProvider.current.group;
    this.groupname = this.group.name;
    this.groupid = this.group.id;
    this.country = this.dataProvider.current.country;
    this.num_ECP = await this.operTools.get_num_of_ECP(this.meeting, this.country.id);

    this.dataProvider.fetch_data('params', this.country.id, true).then((data: any)=> {
      this.country.parameters = data;
    });

    this.dataProvider.fetch_data('accounts', this.group.id, true, true).then(async (data: any)=> {
      this.accounts = data.filter((s)=> s.statut == 0 && s.type == 1); //active accounts & member acounts
      this.group.account = data.find((s)=> s.idowner == this.group.id);
      this.new_totals = await this.operTools.estimate_meeting_totals(this.group.account, this.meeting.id);
      this.nextPage();
    });
  }

  close(){
    this.router.navigate(['/app/tabs/dashboard'], {state: {direction: 'root'}});
  }

  nextPage(){
    this.pageIndex++;
    this.gotoPage();
  }

  previousPage(){
    this.pageIndex--;
    if(this.pageIndex < 1){
      this.router.navigate([this.previousUrl], {state: {direction: 'forward'}});
      return;
    }
    this.gotoPage();
  }

  gotoPage(){
    if(this.pageIndex > 2 && this.componentMap[this.pageIndex-1].action != undefined){
      this.dataProvider.current.meeting = this.meeting;
      this.dataProvider.setCurrent(this.dataProvider.current).then(()=>{
        this.router.navigate([this.componentMap[this.pageIndex-1].action], {state: {direction: 'root'}});
      });
      return;
    }
    this.translate.get(this.componentMap[this.pageIndex].button).subscribe((key)=>{
      this.buttonText = key;
      this.params = {group: this.group, accounts: this.accounts, meeting: this.meeting, country: this.country};
      this.transactionsPageComponent = this.componentMap[this.pageIndex].component;
    });
  }
}
