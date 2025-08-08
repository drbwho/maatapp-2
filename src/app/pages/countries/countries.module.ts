import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CountriesPage } from './countries.page';
import { CountriesPageRoutingModule } from './countries-routing.module';
import { StatusIconsModule } from '../../component/status-icons/status-icons.module';

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
    CountriesPageRoutingModule,
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
  declarations: [CountriesPage]
})
export class CountriesPageModule {}
