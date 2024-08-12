import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeetingDetailsPageRoutingModule } from './meeting-details-routing.module';

import { MeetingDetailsPage } from './meeting-details.page';
import { TransactionsComponent } from '../../component/transactions/transactions.component';
import { StatusIconsModule } from '../../component/status-icons/status-icons.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeetingDetailsPageRoutingModule,
    StatusIconsModule
  ],
  declarations: [MeetingDetailsPage, TransactionsComponent]
})
export class MeetingDetailsPageModule {}
