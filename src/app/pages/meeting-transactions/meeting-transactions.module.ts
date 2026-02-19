import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeetingTransactionsPageRoutingModule } from './meeting-transactions-routing.module';

import { MeetingTransactionsPage } from './meeting-transactions.page';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { CloseComponent } from './pages/close/close.component';
import { GroupReviewComponent } from './pages/group-review/group-review.component';
import { GroupSummaryComponent } from './pages/group-summary/group-summary.component';
import { MaatsComponent } from './pages/maats/maats.component';
import { MemberComponent } from './pages/member/member.component';
import { SettlementComponent } from './pages/settlement/settlement.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeetingTransactionsPageRoutingModule
  ],
  declarations: [MeetingTransactionsPage, AttendanceComponent, CloseComponent, GroupReviewComponent,
    GroupSummaryComponent, MaatsComponent, MemberComponent, SettlementComponent]
})
export class MeetingTransactionsPageModule {}
