import { AfterViewInit, Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ChatService } from '../../providers/chat-service';

@Component({
  selector: 'app-chatroom-filter',
  templateUrl: './chatroom-filter.html',
  styleUrls: ['./chatroom-filter.scss'],
})
export class ChatroomFilterPage implements AfterViewInit {

  queryText = '';
  type = 'users';
  results: any[] = [];

  constructor(
    private modalCtrl: ModalController,
    private chatService: ChatService
  ) { }

  // TODO use the ionViewDidEnter event
  ngAfterViewInit() {
  }

  ionViewWillEnter(){
    this.updateResults();
  }

  updateResults(){
    this.chatService.searchDirectory(this.queryText, this.type ).then((data: any)=>{
      this.results = data.filter((w)=>w.username != this.chatService.chatUser);
    })
  }

  selectResult(result?: any){
    if(result){
      this.modalCtrl.dismiss(result);
    }else{
      this.modalCtrl.dismiss();
    }
  }

}
