import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IntroPageRoutingModule } from './intro-routing.module';

import { IntroPage } from './intro.page';
import { Page1Component } from './pages/page-1/page-1.component';
import { Page2Component } from './pages/page-2/page-2.component';
import { Page3Component } from './pages/page-3/page-3.component';
import { Page4Component } from './pages/page-4/page-4.component';
import { Page5Component } from './pages/page-5/page-5.component';
import { Page6Component } from './pages/page-6/page-6.component';
import { Page7Component } from './pages/page-7/page-7.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IntroPageRoutingModule
  ],
  declarations: [IntroPage, Page1Component, Page2Component, Page3Component, Page4Component, Page5Component, Page6Component, Page7Component]
})
export class IntroPageModule {}
