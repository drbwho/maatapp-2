import { Component, OnInit } from '@angular/core';
import { ConfigData } from '../../providers/config-data';
import { ChatService, ChatMessage, ChatRoom } from '../../providers/chat-service';
import { Events } from '../../providers/events';
import { ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ChatroomFilterPage } from '../chatroom-filter/chatroom-filter';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})

export class ChatPage implements OnInit {
  @ViewChild('scrollElement') chatlist: IonContent;
  @ViewChild('infiniteScroll') infinitescroll: HTMLIonInfiniteScrollElement;

  message = '';
  messages: ChatMessage[] = [];
  currentUser = '';
  currentRoom = '';
  chatRooms: ChatRoom[] = [];
  oldestMessageFetched: ChatMessage = {};
  viewInit = true;

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

  ionViewWillEnter(){
    this.loadCurrents();    
    this.chatService.loadHistory().then((data: any)=>{
      this.messages = data;
      this.oldestMessageFetched = data.at(0);
      setTimeout(()=>this.chatlist.scrollToBottom(1200),10);
    });
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
    this.currentRoom = e.detail.value;
    this.chatService.currentChatRoom = this.chatRooms.find(w => w.rid === this.currentRoom);
    this.loadRoomMessages();
  }

  loadRoomMessages(){
    this.chatService.loadHistory().then((data: any)=>{
      this.messages = data;
      this.oldestMessageFetched = data.at(0);
      // in case is disabled
      this.infinitescroll.disabled = false;
      setTimeout(()=>this.chatlist.scrollToBottom(1200),10)
    });
  }

  onScrollTop(ev){ 
    if(this.viewInit){
      this.viewInit = false;
      (ev as InfiniteScrollCustomEvent).target.complete();
      return;
    }
    console.log("top");
    if(!this.oldestMessageFetched){
      (ev as InfiniteScrollCustomEvent).target.complete();
      return;
    }
    this.chatService.loadHistory(this.oldestMessageFetched.createdAt).then((data: any)=>{
      // prepend old messages
      if(data.length){
        this.messages = data.concat(this.messages);
        this.oldestMessageFetched = data.at(0);
      }else{
        this.infinitescroll.disabled = true;
      }
      setTimeout(() => {
        (ev as InfiniteScrollCustomEvent).target.complete();
      }, 500);
    });
  }

  async presentSearcher() {
    const modal = await this.modalCtrl.create({
      component: ChatroomFilterPage,
      componentProps: { /*excludedTracks: this.excludeTracks*/ }
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      let username = data.username;
      this.chatService.createDirectMessage(username)
        .then((data: ChatRoom)=>{
          // set new room as current
          this.chatService.currentChatRoom = data;
          this.currentRoom = data.rid;
          this.chatRooms = this.chatService.chatRooms;
          this.loadRoomMessages();
          }
        );
    }
  }

}
