import { Injectable } from '@angular/core';
import { RealTimeAPI } from 'rocket.chat.realtime.api.rxjs';
import { ConfigData } from './config-data';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Events } from './events';

interface ChatMessage {
  content?: any,
  roomdata?: any
}

interface MessageType {
  user?: string
  msg?: string
  createdAt?: string
}

@Injectable({
  providedIn: 'root'
})

export class ChatService {

  chatService: RealTimeAPI;
  chatPushToken='';
  chatUserId='';
  chatUserToken='';
  chatUser='';

  user = 'bill';
  pass = '24172417';

  constructor(
    private config: ConfigData,
    private http: HttpClient,
    private events: Events
  ) { }

  connectChat(){
    this.chatService =  new RealTimeAPI("wss://" + this.config.CHAT_HOST + "/websocket");
    this.chatService.connectToServer();
    this.chatService.keepAlive().subscribe();

    const auth = this.chatService.login(this.user, this.pass);
    auth.subscribe(
      (data) => {
        if(data.msg == "result"){
          if(data.error){
            console.log('Login failed');
          }else{
            console.log('Chat user: ',data.result.id,' token: ',data.result.token);
            this.chatUserId = data.result.id;
            this.chatUserToken = data.result.token;
            this.chatUser = this.user;
            this.setUserStatus('online');
            this.subscribeToMessages();
            if(this.chatPushToken) this.updatePushToken();
          }
        }},
      (err) => console.log('Login Error:', err));
  }
  
  subscribeToMessages(){
    this.chatService.subscribe(
      (message: any) => {
        console.log('Message: ', message);
        if(message.msg = "changed" && message.collection == "stream-room-messages"){
          const msg: ChatMessage = {};
          msg.content = message.fields.args[0];
          msg.roomdata = message.fields.args[1];
          this.events.publish('chat:newmessage', msg);
        }
      },
      (err) => console.log('Error:', err),
      () => console.log('subscription completed'));
  
    this.chatService.sendMessage({
      "msg": "sub",
      "id": '' + new Date().getTime(),
      "name": "stream-room-messages",
      "params":[
          "__my_messages__",
          false
      ]
    });
  }

  setUserStatus(status: string){
    // use REST API
    const headers = new HttpHeaders({
      'X-Auth-Token': this.chatUserToken,
      'X-User-Id': this.chatUserId,
      'Content-Type': 'application/json'});
    this.http.post('https://' + this.config.CHAT_HOST + '/api/v1/users.setStatus', {"message":"User status update","status": status} ,{headers: headers})
      .subscribe({error: (error)=>console.log(error)});

    // Real time API working?
    this.chatService.sendMessage({
      "msg": "method",
      "method": "UserPresence:setDefaultStatus",
      "id": '' + new Date().getTime(),
      "params": [ status ]  
    });
  }

  // Send message
  sendMessage(message: string){
    this.chatService.callMethod("sendMessage",{
        _id: this.makeid(18),
        rid: "GENERAL",
        msg: message
    }).subscribe(
      (data) => {
        console.log('Sendmsg: ', data)},
      (err) => console.log('Error:' +err),
      () => console.log('completed'));
  }

  updatePushToken(){
    // use REST API
    const headers = new HttpHeaders({
      'X-Auth-Token': this.chatUserToken,
      'X-User-Id': this.chatUserId,
      'Content-Type': 'application/json'});
    this.http.post('https://' + this.config.CHAT_HOST + '/api/v1/push.token',
      {"type": "gcm", "value": this.chatPushToken, "appName": "ca-22125"},
      {headers: headers})
        .subscribe({error: (error)=>console.log(error)});
  }

  loginRest(){
    // use REST API
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'});
    this.http.post('https://' + this.config.CHAT_HOST + '/api/v1/login',
    { "user": "bill", "password": "24172417" },
      {headers: headers})
        .subscribe({error: (error)=>console.log(error)});
  }

  loadHistory() {
    // use REST API
    const headers = new HttpHeaders({
      'X-Auth-Token': this.chatUserToken,
      'X-User-Id': this.chatUserId,
      'Content-Type': 'application/json'});
    return new Promise((resolve, reject) => {
      this.http.post('https://' + this.config.CHAT_HOST + '/api/v1/method.call/loadHistory',
          {message: `{"msg": "method","method": "loadHistory","id":"` + this.makeid(3, true) +`",
          "params": ["GENERAL",null,50,null, false]}`},
          {headers: headers})
        .subscribe({
          next: (data: any)=>{ 
            var map: MessageType[]=[]; 
            JSON.parse(data.message).result.messages.forEach((msg: any) => {
              var mes: MessageType={};
              mes.msg = msg.msg;
              mes.user = msg.u.username;
              mes.createdAt = msg.ts.$date;
              map.push(mes);
            });
            resolve(map);
          },
          error: (error)=>console.log(error)});
    });
  }

  // Random Generator
  makeid(length: number, numeric = false) {
    let result = '';
    var characters='';
    if(numeric){ characters = '0123456789';
    }else{ characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' };
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
}
