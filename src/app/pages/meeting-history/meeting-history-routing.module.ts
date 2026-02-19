import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MeetingHistoryPage } from './meeting-history.page';

const routes: Routes = [
  {
    path: '',
    component: MeetingHistoryPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MeetingHistoryPageRoutingModule {}
