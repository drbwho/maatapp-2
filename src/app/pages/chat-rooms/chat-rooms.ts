import { Component, OnInit } from '@angular/core';
import { ChatService, ChatUser } from '../../providers/chat-service';
import { ModalController, NavController } from '@ionic/angular';
import { ChatroomFilterPage } from '../chatroom-filter/chatroom-filter';
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
      this.updateRoomInfo();
    });
  }

  ionViewWillEnter(){
    this.updateRoomInfo();
  }

  async updateRoomInfo(){
    this.results = await this.chatService.getMyRooms() as any;
    this.results.filter( (w)=> w.type === 'd').map( async (w)=>{
      let info: any = await this.chatService.getUserInfo(w.users);
      w.name = info.name;
      w.username = info.username;
      w.status = info.status;
      return w;
    });
    // room counters
    let info: any = await this.chatService.getUserInfo(this.chatService.chatUser, true);
    this.results.map((w=>{
      w.unread = info.rooms.find((x)=>x.rid === w.rid).unread
      return w;
    }))
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
