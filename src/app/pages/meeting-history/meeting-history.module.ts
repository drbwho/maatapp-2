import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeetingHistoryPageRoutingModule } from './meeting-history-routing.module';

import { MeetingHistoryPage } from './meeting-history.page';
import { HistoryComponent } from '../../component/history/history.component';

// needed fot translate pipe activation
import { TranslatePipe } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeetingHistoryPageRoutingModule,
    TranslatePipe
  ],
  declarations: [MeetingHistoryPage, HistoryComponent]
})
export class MeetingHistoryPageModule {}
