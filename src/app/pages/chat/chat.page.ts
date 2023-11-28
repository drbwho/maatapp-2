import { Component, OnInit } from '@angular/core';
import { ChatService, ChatMessage, ChatRoom, ChatUser } from '../../providers/chat-service';
import { Events } from '../../providers/events';
import { ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})

export class ChatPage implements OnInit {
  @ViewChild('scrollElement') chatlist: IonContent;
  @ViewChild('infiniteScroll') infinitescroll: HTMLIonInfiniteScrollElement;
  @ViewChild('reactpop') reactpop: HTMLIonPopoverElement;

  message = '';
  messages: ChatMessage[] = [];
  currentUser = '';
  currentRoom: ChatRoom = {};
  chatRooms: ChatRoom[] = [];
  oldestMessageFetched: ChatMessage = {};
  viewInit = true;
  defaultHref = '/app/tabs/chat-rooms';
  editMessage: ChatMessage = null;

  isEmojiPickerVisible: boolean;
  isLoading = false;
  scrollElement;
  ReactIsOpen = false;

  constructor(
    private chatService: ChatService,
    private events: Events,
    private route: ActivatedRoute,
    private actionSheetCtrl: ActionSheetController,
    private loadintCtrl: LoadingController
  ) { }

  ngOnInit() {
    // subscribe to new message arrival
    this.events.subscribe('chat:newmessage', (msg: ChatMessage) => {
      if(this.currentRoom.rid == msg.room.rid){
      //check if is an update first (ex. emoji reaction)
        if(this.messages.find((w)=>w.id===msg.id)){
          this.messages.find((w)=>w.id===msg.id).msg = msg.msg;
          this.messages.find((w)=>w.id===msg.id).updatedAt = msg.updatedAt;
          this.messages.find((w)=>w.id===msg.id).reactions = msg.reactions;
        }else{
          this.messages.push(msg);
          this.currentUser = this.chatService.chatUser;
          this.chatService.markRoomRead(this.currentRoom.rid);
          setTimeout(()=>this.chatlist.scrollToBottom(800),100);
        }
      }
    });
    // subscribe to updated message arrival
    this.events.subscribe('chat:updatedmessage', (msg: ChatMessage) => {
      if(this.currentRoom.rid == msg.room.rid){
        this.messages.find((w)=>w.id===msg.id).msg = msg.msg;
        this.messages.find((w)=>w.id===msg.id).updatedAt = msg.updatedAt;
        this.messages.find((w)=>w.id===msg.id).reactions = msg.reactions;
      }
    });
    // subscribe to deleted message event
    this.events.subscribe('chat:deletedmessage', (msgid: string) => {
        this.messages = this.messages.filter((w)=>w.id != msgid);
    });

    this.currentUser = this.chatService.chatUser;
  }

  async ionViewWillEnter(){
    this.viewInit = true;
    //clear edit buffer
    this.editMessage = null;

    let channel: any = JSON.parse(this.route.snapshot.paramMap.get('channel'));
    if(!channel){
      this.currentRoom = this.chatService.defaultChatRoom;
    }
    if(channel.type == "d"){
      let data: any = await this.chatService.getUserInfo(channel.users.filter((w)=>w!=this.chatService.chatUser).at(0));
      this.currentRoom = channel;
      this.currentRoom.name = data.name;
    }else{
        this.currentRoom = channel;
    }
    this.loadRoomMessages();

  }

  sendMessage(){
    //edited?
    if(this.editMessage){
      this.chatService.updateMessage(this.message, this.editMessage.id, this.currentRoom.rid);
      this.editMessage = null;
      this.message = '';
    //new?
    }else{
      this.chatService.sendMessage(this.message, this.currentRoom.rid);
      this.message = '';
    }
  }

  async loadRoomMessages(){
    this.scrollElement = await this.chatlist.getScrollElement();
    //disable scrolling
    this.scrollElement.style.overflow = 'hidden';
    this.chatService.loadHistory(this.currentRoom.rid).then((data: any)=>{
      this.messages = data;
      this.oldestMessageFetched = data.at(0);
      setTimeout(async ()=>{
        await this.chatlist.scrollToBottom(1500);
        this.viewInit = false;
        //enable scrolling after scrolling to bottom
        this.scrollElement.style.overflow = 'scroll';
      },100);

      //mark room as read
      this.chatService.markRoomRead(this.currentRoom.rid);
    });
  }

  /*onScrollTop(ev){

    return;

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
  }*/

  async handleScroll(ev){
    //console.log('Sroll', ev.detail.currentY);

    if(ev.detail.currentY <= 50 && !this.isLoading && !this.viewInit){
      console.log('Scroll top');
      this.isLoading = true;
      let loading = await this.loadintCtrl.create({
        showBackdrop: false,
        spinner: "circles"
      });
      loading.present();

      //stop scrolling
      this.scrollElement.style.overflow = 'hidden';

      this.chatService.loadHistory(this.currentRoom.rid, this.oldestMessageFetched.createdAt).then((data: any)=>{
        //prepend old messages
        if(data.length){
          this.messages = data.concat(this.messages);
          this.oldestMessageFetched = data.at(0);
        }
        setTimeout(() => {
         //continue scrolling
         this.scrollElement.style.overflow = 'scroll';
         loading.dismiss();
        }, 0);
        //const scrollAmount = scrollElement.scrollHeight ;
       //this.chatlist.scrollToPoint(0,currentY);
      });
    }
    if(ev.detail.currentY > 50 && this.isLoading){
      this.isLoading = false;
    }
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

  addEmoji(event) {
    this.message = `${this.message}${event.emoji.native}`;
  }

  gotfocus(){
    this.isEmojiPickerVisible = false;
  }

  // check if textarea is empty to clear editmessage flag if set
  checkEmpty(){
    if(this.message.length == 0 && this.editMessage){
      this.editMessage = null;
    }
  }

  showReactionPop(ev, message){
    this.reactpop.event = ev;
    this.editMessage = message;
    this.ReactIsOpen = true;
  }

  selReactionEmoji(emojiname){
    this.reactpop.dismiss();
    this.chatService.setReaction(this.editMessage.id, emojiname, true);
    this.editMessage = null;
  }

}

