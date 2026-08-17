import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CountriesPage } from './countries.page';
import { CountriesPageRoutingModule } from './countries-routing.module';
import { StatusIconsModule } from '../../component/status-icons/status-icons.module';

// needed fot translate pipe activation
import { TranslatePipe } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CountriesPageRoutingModule,
    StatusIconsModule,
    // enable translate pipe
    TranslatePipe
  ],
  declarations: [CountriesPage]
})
export class CountriesPageModule {}
