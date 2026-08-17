import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GroupsPageRoutingModule } from './groups-routing.module';

import { GroupsPage } from './groups.page';
import { StatusIconsModule } from '../../component/status-icons/status-icons.module';

// needed fot translate pipe activation
import { TranslatePipe } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GroupsPageRoutingModule,
    StatusIconsModule,
    TranslatePipe
  ],
  declarations: [GroupsPage]
})
export class GroupsPageModule {}
