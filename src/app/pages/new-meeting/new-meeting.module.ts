import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewMeetingPageRoutingModule } from './new-meeting-routing.module';

import { NewMeetingPage } from './new-meeting.page';
import { NewMeetingFormComponent } from '../../component/new-meeting-form/new-meeting-form.component';
import { ActionViewComponent } from '../../component/action-view/action-view.component';

// needed fot translate pipe activation
import { TranslatePipe } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewMeetingPageRoutingModule,
    ActionViewComponent,
    TranslatePipe
  ],
  declarations: [NewMeetingPage, NewMeetingFormComponent]
})
export class NewMeetingPageModule {}
