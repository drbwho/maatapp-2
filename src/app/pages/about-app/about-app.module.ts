import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { AboutAppPage } from './about-app.page';

// needed fot translate pipe activation
import { TranslatePipe } from '@ngx-translate/core';

const routes: Routes = [
  {
    path: '',
    component: AboutAppPage
  }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        // enable translate pipe
        TranslatePipe
    ],
    declarations: [AboutAppPage],
    bootstrap: [AboutAppPage]
})
export class AboutAppPageModule {}
