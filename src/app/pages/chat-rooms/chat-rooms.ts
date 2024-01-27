import { Component, OnInit } from '@angular/core';
import { ChatService, ChatUser } from '../../providers/chat-service';
import { ModalController, NavController } from '@ionic/angular';
import { ChatroomFilterPage } from '../../component/chatroom-filter/chatroom-filter';
import { ChatRoom, ChatMessage } from '../../providers/chat-service';
import { Events } from '../../providers/events';

@Component({
  selector: 'app-chat-rooms',
  templateUrl: './chat-rooms.html',
  styleUrls: ['./chat-rooms.scss'],
})
export class ChatRoomsPage implements OnInit {

  queryText = '';
  type = 'users';
  results: any[] = [];
  defaultHref = '/app/tabs/schedule';

  constructor(
    private chatService: ChatService,
    private nav: NavController,
    private modalCtrl: ModalController,
    private events: Events
  ) { }

  ngOnInit() {
    // subscribe to new message arrival
    this.events.subscribe('chat:newmessage', (msg: ChatMessage) => {
      //add a delay in case of messages raid!
      setTimeout(()=>{
        this.updateRoomInfo();
      }, 1000);
    });
  }

  ionViewWillEnter(){
    this.updateRoomInfo();
  }

  async updateRoomInfo(){
    this.results = await this.chatService.getMyRooms() as any;
    this.results.forEach( async (w)=>{
      //direct messaging channels
      if(w.type === 'd'){
        let info: any = await this.chatService.getUserInfo(w.name);
        w.name = info.name;
        w.username = info.username;
        w.status = info.status;
      }
    });
    this.results.sort((objA, objB) => Number(objB.updated) - Number(objA.updated));
  }

  openChat(channel: ChatUser){
    this.nav.navigateForward('/app/tabs/chat/' + JSON.stringify(channel));
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
          this.nav.navigateForward('/app/tabs/chat/' + JSON.stringify(data));
          }
        );
    }
  }

}
