import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { HomePage } from './home.page';
import { StatusIconsModule } from '../../component/status-icons/status-icons.module';

// needed fot translate pipe activation
import { TranslatePipe } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: HomePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    StatusIconsModule,
    // enable translate pipe
    TranslatePipe
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
