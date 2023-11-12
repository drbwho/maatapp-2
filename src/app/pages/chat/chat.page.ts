import { Component, OnInit } from '@angular/core';
import { ConfigData } from '../../providers/config-data';
import { ChatService } from '../../providers/chat-service';
import { Events } from '../../providers/events';
import { ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';

interface MessageType {
  user?: string
  msg?: string
  createdAt?: string
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})

export class ChatPage implements OnInit {
  @ViewChild('scrollElement') chatlist: IonContent;
  message = '';
  messages = [];
  currentUser = '';

  constructor(
    private config: ConfigData,
    private chatService: ChatService,
    private events: Events
  ) { }

  ngOnInit() {
    this.events.subscribe('chat:newmessage', (msg) => {
      var message: MessageType = {};
      message.msg = msg.content.msg;
      message.user = msg.content.u.username;
      message.createdAt = msg.content._updatedAt.$date;
      this.messages.push(message);

      this.currentUser = this.chatService.chatUser;
      setTimeout(()=>this.chatlist.scrollToBottom(800),100)
    });
  }

  async ionViewWillEnter(){
    this.currentUser = this.chatService.chatUser;
    this.chatService.loadHistory().then((data: any)=>{
      this.messages = data;
      setTimeout(()=>this.chatlist.scrollToBottom(1200),10)
    }).then(()=>{});
  }

  sendMessage(){
    this.chatService.sendMessage(this.message);
    this.message = '';
  }

}
