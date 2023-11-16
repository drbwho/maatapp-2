import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatRoomsPage } from './chat-rooms';

const routes: Routes = [
  {
    path: '',
    component: ChatRoomsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatRoomsPageRoutingModule {}
