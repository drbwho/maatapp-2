import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MeetingDetailsPageRoutingModule } from './meeting-details-routing.module';

import { MeetingDetailsPage } from './meeting-details.page';
import { TransactionsComponent } from '../../component/transactions/transactions.component';
import { StatusIconsModule } from '../../component/status-icons/status-icons.module';

// needed fot translate pipe activation
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MeetingDetailsPageRoutingModule,
    StatusIconsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [MeetingDetailsPage, TransactionsComponent]
})
export class MeetingDetailsPageModule {}
