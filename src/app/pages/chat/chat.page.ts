import { Component, OnInit } from '@angular/core';
import { ConfigData } from '../../providers/config-data';
import { ChatService, ChatMessage, ChatRoom, ChatUser } from '../../providers/chat-service';
import { Events } from '../../providers/events';
import { ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ChatroomFilterPage } from '../chatroom-filter/chatroom-filter';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

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
  currentRoom: ChatRoom = {};
  chatRooms: ChatRoom[] = [];
  oldestMessageFetched: ChatMessage = {};
  viewInit = true;
  defaultHref = '/app/tabs/chat-rooms';

  constructor(
    private config: ConfigData,
    private chatService: ChatService,
    private events: Events,
    private modalCtrl: ModalController,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    let user: ChatUser = JSON.parse(this.route.snapshot.paramMap.get('channel')) as ChatUser;
    if(user){
      let username = user.username;
      this.chatService.createDirectMessage(username)
        .then((data: ChatRoom)=>{
          // set new room as current
          this.currentRoom = data;
          this.loadCurrents();
          this.loadRoomMessages();      
        });
    }else{
        this.currentRoom = this.chatService.defaultChatRoom;
        this.loadCurrents();
        this.loadRoomMessages();
    }

    // subscribe to new message arrival
    this.events.subscribe('chat:newmessage', (msg: ChatMessage) => {
      if(this.currentRoom.rid == msg.room.rid){
        this.messages.push(msg);
        this.currentUser = this.chatService.chatUser;
        setTimeout(()=>this.chatlist.scrollToBottom(800),100);
      }else{
        this.chatRooms.find((w)=>w.rid === msg.room.rid).unread++;
      }
    });
  }

  ionViewWillEnter(){
    this.loadCurrents();    
    this.chatService.loadHistory(this.currentRoom.rid).then((data: any)=>{
      this.messages = data;
      this.oldestMessageFetched = data.at(0);
      setTimeout(()=>this.chatlist.scrollToBottom(1200),10);
    });
  }

  sendMessage(){
    this.chatService.sendMessage(this.message, this.currentRoom.rid);
    this.message = '';
  }

  loadCurrents(){
    this.currentUser = this.chatService.chatUser;
    this.chatRooms = this.chatService.chatRooms;
  }
  
  roomChange(e) {
    this.currentRoom = e.detail.value;
    this.loadRoomMessages();
  }

  loadRoomMessages(){
    this.chatService.loadHistory(this.currentRoom.rid).then((data: any)=>{
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
          this.currentRoom = data;
          this.chatRooms = this.chatService.chatRooms;
          this.loadRoomMessages();
          }
        );
    }
  }

}
