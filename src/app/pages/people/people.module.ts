import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Routes, RouterModule } from '@angular/router';

import { PeoplePage } from './people';
import { PeoplePageRoutingModule } from './people-routing.module';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser';

const routes: Routes = [
  {
    path: '',
    component: PeoplePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    PeoplePageRoutingModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PeoplePage],
  providers: [InAppBrowser]
})
export class PeoplePageModule {}
