import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewMeetingPageRoutingModule } from './new-meeting-routing.module';

import { NewMeetingPage } from './new-meeting.page';
import { MeetingFormComponent } from '../../component/meeting-form/meeting-form.component';

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
    NewMeetingPageRoutingModule,
    TranslateModule.forChild({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
  ],
  declarations: [NewMeetingPage, MeetingFormComponent]
})
export class NewMeetingPageModule {}
