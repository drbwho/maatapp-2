import { Component, OnInit } from '@angular/core';
import { ChatService, ChatMessage, ChatRoom, ChatUser } from '../../providers/chat-service';
import { Events } from '../../providers/events';
import { ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';

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
  editMessage: ChatMessage = null;

  constructor(
    private chatService: ChatService,
    private events: Events,
    private route: ActivatedRoute,
    private actionSheetCtrl: ActionSheetController
  ) { }

  ngOnInit() {
    let channel: any = JSON.parse(this.route.snapshot.paramMap.get('channel'));
    if(!channel){
      this.currentRoom = this.chatService.defaultChatRoom;
      this.loadRoomMessages();
    }
    if(channel.type == "d"){
      this.chatService.getUserInfo(channel.users.filter((w)=>w!=this.chatService.chatUser).at(0)).then((data: any)=>{
        this.currentRoom = channel;
        this.currentRoom.name = data.name;
        this.loadRoomMessages();
      });
    }else{
        this.currentRoom = channel;
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
    // subscribe to updated message arrival
    this.events.subscribe('chat:updatedmessage', (msg: ChatMessage) => {
      if(this.currentRoom.rid == msg.room.rid){
        this.messages.find((w)=>w.id===msg.id).msg = msg.msg;
        this.messages.find((w)=>w.id===msg.id).updatedAt = msg.updatedAt;
      }
    });
    // subscribe to delete message event
    this.events.subscribe('chat:deletedmessage', (msgid: string) => {
        this.messages = this.messages.filter((w)=>w.id != msgid);      
    });

    this.currentUser = this.chatService.chatUser;
  }

  ionViewWillEnter(){  
    this.chatService.loadHistory(this.currentRoom.rid).then((data: any)=>{
      this.messages = data;
      this.oldestMessageFetched = data.at(0);
      setTimeout(()=>this.chatlist.scrollToBottom(1200),10);

      //mark room as read
      this.chatService.markRoomRead(this.currentRoom.rid);
    });
    //clear edit buffer
    this.editMessage = null;
  }

  sendMessage(){
    //edit?
    if(this.editMessage){
      this.chatService.updateMessage(this.message, this.editMessage.id, this.currentRoom.rid);
      this.editMessage = null;
      this.message = '';
    }else{
      this.chatService.sendMessage(this.message, this.currentRoom.rid);
      this.message = '';
    }
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
    this.chatService.loadHistory(this.currentRoom.rid, this.oldestMessageFetched.createdAt).then((data: any)=>{
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

  async openActionSheet(msg){
    const actionSheet = await this.actionSheetCtrl.create({
//      header: 'Message actions',
      buttons: [
        {
          icon: 'create-outline',
          text: 'edit',
          htmlAttributes: {
            'aria-label': 'edit',
          },
          handler: ()=>{
            this.message = msg.msg;
            this.editMessage = msg;
          }
        },
        {
          icon: 'close',
          text: 'delete',
          htmlAttributes: {
            'aria-label': 'delete',
          },
          handler: ()=>{
            this.chatService.deleteMessage(msg.id);
          }
        },
        {
          icon: 'exit-outline',
          text: 'cancel',
          htmlAttributes: {
            'aria-label': 'close',
          },
        },
      ],
    });
    actionSheet.present();
  }

}

