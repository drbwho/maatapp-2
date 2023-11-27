import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatPageRoutingModule } from './chat-routing.module';
import { ChatroomFilterPage } from '../../component/chatroom-filter/chatroom-filter';
import { ChatPage } from './chat.page';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { PickerModule } from '@ctrl/ngx-emoji-mart';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatPageRoutingModule,
    ScrollingModule,
    PickerModule
  ],
  declarations: [ChatPage, ChatroomFilterPage]
})
export class ChatPageModule {}
