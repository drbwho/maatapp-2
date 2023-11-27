import { Injectable } from '@angular/core';
import { RealTimeAPI } from 'rocket.chat.realtime.api.rxjs';
import { ConfigData } from './config-data';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Events } from './events';

export interface ChatMessage {
  id?: string
  user?: string
  msg?: string
  createdAt?: string
  updatedAt?: string
  room?: ChatRoom
  reactions?:any
}

export interface ChatRoom {
  rid?: string,
  name?: string
  type?: string,
  users?: string[],
  unread?:number,
  updated?: Date
}

export interface ChatUser {
  id?: string
  name?: string,
  username?: string,
  status?: string
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
  chatRooms: ChatRoom[] = [];
  defaultChatRoom: ChatRoom = {rid:"GENERAL", name: "general"};
  numMessagesToFetch = 20;

  headers: HttpHeaders;
 

  user = 'bill';
  pass = '24172417';

  constructor(
    private config: ConfigData,
    private http: HttpClient,
    private events: Events
  ) { }

  // Connect to CHAT Server
  connectChat(){
    this.chatService =  new RealTimeAPI("wss://" + this.config.CHAT_HOST + "/websocket");
    this.chatService.connectToServer();
    this.chatService.keepAlive().subscribe();

    const auth = this.chatService.login(this.user, this.pass);
    return new Promise((resolve, reject)=>{
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
              this.headers = new HttpHeaders({
                'X-Auth-Token': this.chatUserToken,
                'X-User-Id': this.chatUserId,
                'Content-Type': 'application/json'});

              this.setUserStatus('online');
              this.subscribeToMessages();
              if(this.chatPushToken) this.updatePushToken();
            }
          }
          resolve(true);  
        },
        (err) => { console.log('Login Error:', err); reject(false) });
    });
  }

  // Subscribe to message updates
  subscribeToMessages(){
    this.chatService.subscribe(
      (message: any) => {
        //console.log('Message: ', message);
        if(message.msg = "changed" && message.collection == "stream-room-messages"){
          const msg: ChatMessage = {};
          msg.id = message.fields.args[0]._id;
          msg.msg = message.fields.args[0].msg;
          msg.user = message.fields.args[0].u.username;
          msg.createdAt = message.fields.args[0].ts.$date;
          msg.updatedAt = message.fields.args[0]._updatedAt.$date;
          msg.room = {};
          msg.room.rid = message.fields.args[0].rid;
          msg.room.type = message.fields.args[1].roomType;
          msg.room.name = message.fields.args[1].roomName;
          //its update!
          if(message.fields.args[0].editedAt){
            this.events.publish('chat:updatedmessage', msg);
            console.log('UpdateMsg');
          //its new!
          }else{
            this.events.publish('chat:newmessage', msg);
            console.log('NewMsg');
          }
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

  // Update user presence
  setUserStatus(status: string){
    // use REST API
    this.http.post('https://' + this.config.CHAT_HOST + '/api/v1/users.setStatus', {"message":"User status update","status": status} ,{headers: this.headers})
      .subscribe({error: (error)=>console.log(error)});

    // Real time API working?
    this.chatService.sendMessage({
      "msg": "method",
      "method": "UserPresence:setDefaultStatus",
      "id": '' + new Date().getTime(),
      "params": [ status ]
    });
  }

  // Get user presence
  getUserStatus(uid: string){
    // use REST API
    return new Promise((resolve)=>{
      this.http.get('https://' + this.config.CHAT_HOST + '/api/v1/users.getPresence?userId=' + uid, {headers: this.headers})
      .subscribe({
        next: (data: any)=>{
          resolve(data.presence);
        },
        error: (error)=>console.log(error)});
    });
  }

  // Send chat message
  sendMessage(message: string, roomId: string){
    this.chatService.callMethod("sendMessage",{
        _id: this.makeid(18),
        rid: roomId,
        msg: message
    }).subscribe(
      (data) => {
        console.log('Sendmsg: ', data)},
      (err) => console.log('Error:' +err),
      () => console.log('completed'));
  }

  // Update chat message
  updateMessage(message: string, msgId: string, roomId: string){
    this.chatService.callMethod("updateMessage",{
              _id: msgId,
              rid: roomId,
              msg: message
    }).subscribe(
      (data) => {
        console.log('Updatemsg: ', data)},
      (err) => console.log('Error:' +err),
      () => console.log('completed'));
  }

  // Delete chat message
  deleteMessage(msgId: string){
    this.chatService.callMethod("deleteMessage",{
              _id: msgId
    }).subscribe(
      (data) => {
        console.log('Deletemsg: ', data);
          this.events.publish('chat:deletedmessage', msgId);
      },
      (err) => console.log('Error:' +err),
      () => console.log('completed'));
  }

  // Open a new room for direct message
  createDirectMessage(username: string){
    return new Promise((resolve)=>{
      this.chatService.callMethod("createDirectMessage", username).subscribe({
        next: (data) => {
          // update my rooms
          this.getMyRooms().then(()=>{
            resolve({
              rid: data.result.rid,
              type: data.result.t,
              users: data.result.usernames
            });
          })
        },
        error: (error)=>console.log(error)});
    });
  }

  // Get rooms user belongs to
  getMyRooms(){
    return new Promise((resolve)=>{
      this.chatService.callMethod("rooms/get",{
        id: this.makeid(18),
        params: [0]
      }).subscribe({
      next: (data) => {
        this.chatRooms = [];
        data.result.forEach((rm: any)=>{
          var room: ChatRoom = {};
          room.rid = rm._id;
          room.name = (rm.name ? rm.name : rm.fname);
          room.type = rm.t;
          room.updated = rm._updatedAt.$date;
          if(rm.t == 'd'){
            room.users = rm.usernames.filter((w)=> w != this.chatUser);
            room.name = room.users.at(0);
          }
          room.unread = 0;
          this.chatRooms.push(room);
        });
        resolve(this.chatRooms);
      },
      error: (err) => console.log('Error:' +err)})
    })
  }

  // Update Device FCM Token
  updatePushToken(){
    // use REST API
    this.http.post('https://' + this.config.CHAT_HOST + '/api/v1/push.token',
      {"type": "gcm", "value": this.chatPushToken, "appName": "ca-22125"},
      {headers: this.headers})
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

  // Load Room history
  loadHistory(roomid: string, lastMessageDate?:string) {
    // use REST API
    return new Promise((resolve, reject) => {
      this.http.post('https://' + this.config.CHAT_HOST + '/api/v1/method.call/loadHistory',
          {message: `{"msg": "method","method": "loadHistory","id":"` + this.makeid(3, true) +`",
          "params": ["` + roomid + `",` + (lastMessageDate?`{"$date":`+lastMessageDate+`}`:null) + `,` + this.numMessagesToFetch + `,null, false]}`},
          {headers: this.headers})
        .subscribe({
          next: (data: any)=>{ 
            var map: ChatMessage[]=[];
            if(JSON.parse(data.message).result.messages === undefined){
              resolve(map);
              return;
            }
            JSON.parse(data.message).result.messages.forEach((msg: any) => {
              //filter joining messages
              if(!msg.t){
                map.push({
                  id: msg._id,
                  msg: msg.msg,
                  user: msg.u.username,
                  createdAt: msg.ts.$date,
                  updatedAt: msg._updatedAt.$date,
                  reactions: (msg.reactions?this.emojiIt(Object.keys(msg.reactions)[0]):null)
                });
              }
            });
            //sort descending
            map = map.sort((objA, objB) => Number(objA.createdAt) - Number(objB.createdAt));
            resolve(map);
          },
          error: (error)=>console.log(error)});
    });
  }

  // Search all directory
  searchDirectory(queryText: string, type: string){
    // use REST API
   return new Promise((resolve, reject) => {
      this.http.get('https://' + this.config.CHAT_HOST + '/api/v1/directory' + '?query=' + JSON.stringify({"text": queryText, "type": type, "workspace": "local"}),
        {headers: this.headers})
        .subscribe({
          next: (data: any)=>{
            var map: ChatUser[]=[];
            data.result.forEach((usr: any) => {
              map.push({
                id: usr._id,
                name: usr.name,
                username: usr.username,
                status: usr.status
              });
            });
            //sort alphabetically
            map.sort((a, b) => a.name.localeCompare(b.name));
            resolve(map);
          },
          error: (error)=>console.log(error)});
    });
  }

  spotlight(queryText: string, type: string){
    // use REST API
    return new Promise((resolve, reject) => {
      this.http.post('https://' + this.config.CHAT_HOST + '/api/v1/method.call/spotlight',
        {message:	`{"msg":"method","id":"` + this.makeid(3, true) + `","method":"spotlight","params":["` + queryText + `",[],{"users":true,"rooms":true,"includeFederatedRooms":true}]}`},
        {headers: this.headers})
        .subscribe({
          next: (data: any)=>{
            var map: ChatUser[]=[];
            if(!JSON.parse(data.message).hasOwnProperty('result')){
              resolve(map);
              return;
            }
            JSON.parse(data.message).result.users.forEach((usr: any) => {
              map.push({
                id: usr._id,
                name: usr.name,
                username: usr.username,
                status: usr.status
              });
            });
            //sort alphabetically
            map.sort((a, b) => a.name.localeCompare(b.name));
            resolve(map);
          },
          error: (error)=>console.log(error)});
    });
  }

  getUserInfo(username: string, loadRooms?: boolean) {
    return new Promise((resolve, reject) => {
      this.http.get('https://' + this.config.CHAT_HOST + '/api/v1/users.info?username=' + username + (loadRooms?'&fields={"userRooms": 1}':''),
        {headers: this.headers})
        .subscribe({
          next: (data: any)=>{
            if(loadRooms){
              resolve({name: data.user.name, username: data.user.username, status: data.user.status, rooms: data.user.rooms});
            }else{
              resolve({name: data.user.name, username: data.user.username, status: data.user.status});
            }
          },
          error: (error)=>console.log(error)});
    });
  }

  markRoomRead(rid: string){
    this.http.post('https://' + this.config.CHAT_HOST + '/api/v1/subscriptions.read',
      {rid: rid},
      {headers: this.headers}).subscribe(()=>{
        this.events.publish('chat:markroomread');
      });
 
  }

  // Random Id Generator
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

  emojiIt(text) {
  const emojiMap = {
    grin: "&#x1f602",
    smiley: "&#x1f60e",
    happy: "&#x1f600"
  }
  const regExpression = /:([^:]*):/g
    let result;
    while (result = regExpression.exec(text)) {
      text = text.replace(result[0], emojiMap[result[1]]);
    }
    return text;
  }
}
