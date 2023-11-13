import { Component, OnInit } from '@angular/core';
import { ConfigData } from '../../providers/config-data';
import { ChatService, ChatMessage, ChatRoom } from '../../providers/chat-service';
import { Events } from '../../providers/events';
import { ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ChatroomFilterPage } from '../chatroom-filter/chatroom-filter';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})

export class ChatPage implements OnInit {
  @ViewChild('scrollElement') chatlist: IonContent;
  message = '';
  messages: ChatMessage[] = [];
  currentUser = '';
  currentRoom = '';
  chatRooms: ChatRoom[] = [];

  constructor(
    private config: ConfigData,
    private chatService: ChatService,
    private events: Events,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.loadCurrents();

    this.events.subscribe('chat:newmessage', (msg: ChatMessage) => {
      this.messages.push(msg);
      this.currentUser = this.chatService.chatUser;
      setTimeout(()=>this.chatlist.scrollToBottom(800),100)
    });
  }

  async ionViewWillEnter(){
    this.loadCurrents();    
    this.chatService.loadHistory().then((data: any)=>{
      this.messages = data;
      setTimeout(()=>this.chatlist.scrollToBottom(1200),10)
    }).then(()=>{});
  }

  sendMessage(){
    this.chatService.sendMessage(this.message, this.chatService.currentChatRoom.rid);
    this.message = '';
  }

  loadCurrents(){
    this.currentUser = this.chatService.chatUser;
    if(this.chatService.currentChatRoom){
      this.currentRoom = this.chatService.currentChatRoom.rid;
    }
    this.chatRooms = this.chatService.chatRooms;
  }
  
  roomChange(e) {
    console.log('ionChange fired with value: ' + e.detail.value);
    this.currentRoom = e.detail.value;
    this.chatService.currentChatRoom = this.chatRooms.find(w => w.rid === this.currentRoom);
    this.chatService.loadHistory().then((data: any)=>{
      this.messages = data;
      setTimeout(()=>this.chatlist.scrollToBottom(1200),10)
    }).then(()=>{});
  }

  async presentFilter() {
    const modal = await this.modalCtrl.create({
      component: ChatroomFilterPage,
      componentProps: { /*excludedTracks: this.excludeTracks*/ }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      //this.excludeTracks = data;
      //this.updateSchedule();
    }
  }

}
