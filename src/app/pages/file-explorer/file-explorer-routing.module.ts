import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FileExplorerPage } from './file-explorer.page';

const routes: Routes = [
  {
    path: '',
    component: FileExplorerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FileExplorerPageRoutingModule {}
