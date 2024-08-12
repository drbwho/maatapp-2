import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StatusIconsComponent } from '../../component/status-icons/status-icons.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  declarations: [StatusIconsComponent],
  exports: [StatusIconsComponent]
})
export class StatusIconsModule {}