import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeetingsPageRoutingModule } from './meetings-routing.module';

import { MeetingsPage } from './meetings.page';
import { MeetingCardComponent } from '../../component/meeting-card/meeting-card.component';
import { ActionViewComponent } from '../../component/action-view/action-view.component';
import { ScrollingModule } from '@angular/cdk/scrolling';

// needed fot translate pipe activation
import { TranslatePipe } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeetingsPageRoutingModule,
    ActionViewComponent,
    ScrollingModule,
    TranslatePipe
  ],
  declarations: [MeetingsPage, MeetingCardComponent]
})
export class MeetingsPageModule {}
