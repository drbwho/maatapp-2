import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FileExplorerPageRoutingModule } from './file-explorer-routing.module';

import { FileExplorerPage } from './file-explorer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FileExplorerPageRoutingModule
  ],
  declarations: [FileExplorerPage]
})
export class FileExplorerPageModule {}
