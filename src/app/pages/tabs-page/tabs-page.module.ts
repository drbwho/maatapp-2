import { DatesPageModule } from './../dates/dates.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { TabsPage } from './tabs-page';
import { TabsPageRoutingModule } from './tabs-page-routing.module';

import { AboutPageModule } from '../about/about.module';

@NgModule({
  imports: [
    AboutPageModule,
    CommonModule,
    IonicModule,
    TabsPageRoutingModule,
    DatesPageModule
  ],
  declarations: [
    TabsPage,
  ]
})
export class TabsModule { }
