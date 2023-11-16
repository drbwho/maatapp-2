import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatRoomsPageRoutingModule } from './chat-rooms-routing.module';

import { ChatRoomsPage } from './chat-rooms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatRoomsPageRoutingModule
  ],
  declarations: [ChatRoomsPage]
})
export class ChatRoomsPageModule {}
