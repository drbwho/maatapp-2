import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { TabsPage } from './tabs-page';
import { TabsPageRoutingModule } from './tabs-page-routing.module';

import { SelectLangComponent } from '../../component/select-lang/select-lang.component';

// needed fot translate pipe activation
import { TranslatePipe } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TabsPageRoutingModule,
    // enable translate pipe
    TranslatePipe
  ],
  declarations: [
    TabsPage, SelectLangComponent
  ]
})
export class TabsModule { }
