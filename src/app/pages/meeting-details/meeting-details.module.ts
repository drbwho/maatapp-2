import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeetingDetailsPageRoutingModule } from './meeting-details-routing.module';

import { MeetingDetailsPage } from './meeting-details.page';
import { TransactionsComponent } from '../../component/transactions/transactions.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeetingDetailsPageRoutingModule
  ],
  declarations: [MeetingDetailsPage, TransactionsComponent]
})
export class MeetingDetailsPageModule {}
