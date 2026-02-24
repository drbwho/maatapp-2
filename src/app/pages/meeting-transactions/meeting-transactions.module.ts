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
import { ContributionsComponent } from './pages/contributions/contributions.component';
import { MaatsComponent } from './pages/maats/maats.component';
import { SettlementComponent } from './pages/settlement/settlement.component';
import { BalanceComponent } from './pages/balance/balance.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';
import { LoanInfoComponent } from '../../component/loan-info/loan-info.component';

// needed fot translate pipe activation
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader();
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeetingTransactionsPageRoutingModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [MeetingTransactionsPage, AttendanceComponent, CloseComponent, GroupReviewComponent,
    GroupSummaryComponent, MaatsComponent, SettlementComponent, ContributionsComponent,
    BalanceComponent, TransactionsComponent, LoanInfoComponent]
})
export class MeetingTransactionsPageModule {}
