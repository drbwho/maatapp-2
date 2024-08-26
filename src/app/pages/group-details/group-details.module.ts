import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GroupDetailsPageRoutingModule } from './group-details-routing.module';

import { GroupDetailsPage } from './group-details.page';
import { StatusIconsModule } from '../../component/status-icons/status-icons.module';
import { AccountInfoComponent } from '../../component/account-info/account-info.component';
import { MeetingFormComponent } from '../../component/meeting-form/meeting-form.component';
import { HistoryComponent } from '../../component/history/history.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GroupDetailsPageRoutingModule,
    StatusIconsModule
  ],
  declarations: [GroupDetailsPage, AccountInfoComponent, MeetingFormComponent, HistoryComponent]
})
export class GroupDetailsPageModule {}
