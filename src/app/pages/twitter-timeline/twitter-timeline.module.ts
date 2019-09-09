import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TwitterTimelinePage } from './twitter-timeline.page';

import { Ng4TwitterTimelineModule, Ng4TwitterTimelineService } from 'ng4-twitter-timeline/lib/index';

const routes: Routes = [
  {
    path: '',
    component: TwitterTimelinePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    Ng4TwitterTimelineModule
  ],
  declarations: [TwitterTimelinePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TwitterTimelinePageModule {}
