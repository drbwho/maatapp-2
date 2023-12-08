import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Routes, RouterModule } from '@angular/router';

import { PeoplePage } from './people';
import { PeoplePageRoutingModule } from './people-routing.module';

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
  declarations: [PeoplePage]
})
export class PeoplePageModule {}
