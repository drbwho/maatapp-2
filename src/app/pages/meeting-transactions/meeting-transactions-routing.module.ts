import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MeetingTransactionsPage } from './meeting-transactions.page';

const routes: Routes = [
  {
    path: '',
    component: MeetingTransactionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MeetingTransactionsPageRoutingModule {}
