import { Component, OnInit } from '@angular/core';
import { ChatService, ChatUser } from '../../providers/chat-service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

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
    private nav: NavController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.updateResults();
  }

  updateResults(){
    this.chatService.searchDirectory(this.queryText, this.type ).then((data: any)=>{
      this.results = data;
    })
  }

  openChat(channel: ChatUser){
    this.nav.navigateForward('/app/tabs/chat/' + JSON.stringify(channel));
  }

}
