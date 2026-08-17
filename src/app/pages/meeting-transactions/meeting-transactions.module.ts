import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeetingTransactionsPageRoutingModule } from './meeting-transactions-routing.module';

import { MeetingTransactionsPage } from './meeting-transactions.page';
import { AttendanceComponent } from './pages/attendance/attendance.component';
import { EndComponent } from './pages/end/end.component';
import { GroupReviewComponent } from './pages/group-review/group-review.component';
import { GroupSummaryComponent } from './pages/group-summary/group-summary.component';
import { ContributionsComponent } from './pages/contributions/contributions.component';
import { MaatsComponent } from './pages/maats/maats.component';
import { SettlementComponent } from './pages/settlement/settlement.component';
import { BalanceComponent } from './pages/balance/balance.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { LoanInfoComponent } from '../../component/loan-info/loan-info.component';

// needed fot translate pipe activation
import { TranslatePipe } from '@ngx-translate/core';
import { AutoFitTextModule } from '../../directives/auto-fit-text.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeetingTransactionsPageRoutingModule,
    TranslatePipe,
    AutoFitTextModule,
  ],
  declarations: [MeetingTransactionsPage, AttendanceComponent, EndComponent, GroupReviewComponent,
    GroupSummaryComponent, MaatsComponent, SettlementComponent, ContributionsComponent,
    BalanceComponent, TransactionsComponent, LoanInfoComponent]
})
export class MeetingTransactionsPageModule {}
