import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GroupDetailsPageRoutingModule } from './group-details-routing.module';

import { GroupDetailsPage } from './group-details.page';
import { StatusIconsModule } from '../../component/status-icons/status-icons.module';
import { AccountInfoComponent } from '../../component/account-info/account-info.component';
import { HistoryComponent } from '../../component/history/history.component';

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
    GroupDetailsPageRoutingModule,
    StatusIconsModule,
    // enable translate pipe
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [GroupDetailsPage, AccountInfoComponent, HistoryComponent]
})
export class GroupDetailsPageModule {}
