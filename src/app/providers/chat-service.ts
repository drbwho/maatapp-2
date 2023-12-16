import { Injectable } from '@angular/core';
import { RealTimeAPI } from 'rocket.chat.realtime.api.rxjs';
import { ConfigData } from './config-data';
import { HttpHeaders, HttpClient, HttpEventType } from '@angular/common/http';
import { Events } from './events';
import { ToastController } from '@ionic/angular';

export interface ChatMessage {
  id?: string
  user?: string
  msg?: string
  createdAt?: string
  updatedAt?: string
  room?: ChatRoom
  reactions?:any[]
  attachments?:any[]
}

export interface ChatRoom {
  rid?: string,
  name?: string,
  fname?: string,
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

  chatAPI: RealTimeAPI;
  chatPushToken='';
  chatUserId='';
  chatUserToken='';
  chatUser='';
  chatRooms: ChatRoom[] = [];
  roomSubscriptions: any[] = [];
  defaultChatRoom: ChatRoom = {rid:"GENERAL", name: "general"};
  numMessagesToFetch = 20;

  headers: HttpHeaders;

  user = 'bill';
  pass = '24172417';

  constructor(
    private config: ConfigData,
    private http: HttpClient,
    private events: Events,
    private toastCtrl: ToastController
  ) { }

  // Connect to CHAT Server
  async connectChat(){
    this.chatAPI =  new RealTimeAPI("wss://" + this.config.CHAT_HOST + "/websocket");
    this.chatAPI.connectToServer();
    this.chatAPI.keepAlive().subscribe();

    const auth = this.chatAPI.login(this.user, this.pass);
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
        (err) => {
          console.log('Login Error:', err);
          this.showAlert('Cannot login to Chat Server. Please check your network status.');
          reject(false) });
    });
  }

  // Subscribe to message updates
  subscribeToMessages(){
    this.chatAPI.subscribe(
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

          // parse reactions
          let reactions=[];
          if(typeof(message.fields.args[0].reactions)!="undefined"){
            Object.entries(message.fields.args[0].reactions).forEach(([key, value]: any)=>{
              reactions.push({
                emoji: this.emojiIt(key),
                emojiname: key,
                users: value.usernames.length,
                ismine: (value.usernames.indexOf(this.chatUser) >=0 ? true : false)
              })
            })
          }
          msg.reactions = (message.fields.args[0].reactions ? reactions : null)

          // parse attachments (ex. audio messages)
          if(typeof(message.fields.args[0].attachments)!="undefined"){
            msg.attachments = message.fields.args[0].attachments;
          }

          // preload photos
          this.loadPhotos(null, msg);

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

        // deleted message event
        if(message.msg = "changed" && message.collection == "stream-notify-room"){
          if(typeof(message.fields.args[0]._id!="undefined" && message.fields.eventName.indexOf('deleteMessage') > -1)){
            const mid = message.fields.args[0]._id;
            this.events.publish('chat:deletedmessage', mid);
          }
        }
      },
      (err) => console.log('Error:', err),
      () => console.log('subscription completed'));

    this.chatAPI.sendMessage({
      "msg": "sub",
      "id": '' + new Date().getTime(),
      "name": "stream-room-messages",
      "params":[
          "__my_messages__",
          false
      ]
    });
  }

  //subscribe to room deletemessage events
  subscribeRoomDeletions(rid){
    //unsubscribe all previous subs
    if(this.roomSubscriptions.length){
      this.roomSubscriptions.forEach(w=>{
        this.chatAPI.sendMessage({
          "msg": "unsub",
          "id": w
        });
      })
      this.roomSubscriptions = [];
    }

    const id = '' + new Date().getTime();
    this.chatAPI.sendMessage({
      "msg": "sub",
      "id": id,
      "name": "stream-notify-room",
      "params":[
          rid + "/deleteMessage",
          false
      ]
    });
    this.roomSubscriptions.push(id);
  }

  // Update user presence
  setUserStatus(status: string){
    // use REST API
    this.http.post('https://' + this.config.CHAT_HOST + '/api/v1/users.setStatus', {"message":"User status update","status": status}, {headers: this.headers})
      .subscribe({error: (error)=>console.log(error)});

    // Real time API working?
    //this.chatAPI.callMethod("UserPresence:setDefaultStatus",
    //  [ status ]
    //);
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
        error: (error)=>{
          console.log(error);
          this.showAlert('Cannot get info from Chat Server. Please check your network status.');
        }
      });
    });
  }

  // Send chat message
  sendMessage(message: string, roomId: string){
    this.chatAPI.callMethod("sendMessage",{
        _id: this.makeid(18),
        rid: roomId,
        msg: message
    }).subscribe(
      (data) => {
        console.log('Sendmsg: ', data)},
      (err) =>{
        console.log('Error:' +err);
        this.showAlert('Cannot send message to Chat Server. Please check your network status.');
      },
      () => console.log('completed'));
  }

  // Update chat message
  updateMessage(message: string, msgId: string, roomId: string){
    this.chatAPI.callMethod("updateMessage",{
              _id: msgId,
              rid: roomId,
              msg: message
    }).subscribe(
      (data) => {
        console.log('Updatemsg: ', data)},
      (err) => {
        console.log('Error:' +err);
        this.showAlert('Cannot update message to Chat Server. Please check your network status.');
      },
      () => console.log('completed'));
  }

  // Delete chat message
  deleteMessage(msgId: string){
    this.chatAPI.callMethod("deleteMessage",{
              _id: msgId
    }).subscribe(
      (data) => {
        console.log('Deletemsg: ', data);
          this.events.publish('chat:deletedmessage', msgId);
      },
      (err) => {
        console.log('Error:' +err);
        this.showAlert('Cannot delete from  Chat Server. Please check your network status.');
      },
      () => console.log('completed'));
  }

  // Open a new room for direct message
  createDirectMessage(username: string){
    return new Promise((resolve)=>{
      this.chatAPI.callMethod("createDirectMessage", username).subscribe({
        next: (data) => {
          // update my rooms
          this.getMyRooms().then((rooms: ChatRoom[])=>{
            resolve(rooms.find((w)=>w.rid === data.result.rid));
            /*  {
              rid: data.result.rid,
              type: data.result.t,
              users: data.result.usernames
            });*/
          })
        },
        error: (error)=>{
          console.log(error);
          this.showAlert('Cannot create channel to Chat Server. Please check your network status.');
        }
      });
    });
  }

  // Get rooms user belongs to
  getMyRooms(){
    return new Promise((resolve)=>{
      this.chatAPI.callMethod("subscriptions/get")
      .subscribe({
        next: (data) => {
          this.chatRooms = [];
          if(typeof(data.result)!="undefined"){
            data.result.forEach((rm: any)=>{
              var room: ChatRoom = {};
              room.rid = rm.rid;
              room.name = rm.name;
              room.fname = rm.fname;
              room.type = rm.t;
              room.updated = (rm._updatedAt?rm._updatedAt.$date:null);
              room.unread = rm.unread;
              this.chatRooms.push(room);
            });
          }
          resolve(this.chatRooms);
        },
        error: (err) =>{
          console.log('Error:' +err);
          this.showAlert('Cannot get info from Chat Server. Please check your network status.');
        }
      })
    })
  }

  // Update Device FCM Token
  updatePushToken(){
    // use REST API
    this.http.post('https://' + this.config.CHAT_HOST + '/api/v1/push.token',
      {"type": "gcm", "value": this.chatPushToken, "appName": "ca-22125"},
      {headers: this.headers})
        .subscribe({error: (error)=>{
          console.log(error);
          this.showAlert('Cannot connect to Chat Server. Please check your network status.');
        }
      });
  }

  loginRest(){
    // use REST API
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'});
    this.http.post('https://' + this.config.CHAT_HOST + '/api/v1/login',
    { "user": "bill", "password": "24172417" },
      {headers: headers})
        .subscribe({error: (error)=>{
          console.log(error);
          this.showAlert('Cannot connect to Chat Server. Please check your network status.');
        }
      });
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
              //filter joining etc. messages
              if(!msg.t){
                //load reactions
                let reactions=[];
                if(typeof(msg.reactions)!="undefined"){
                  Object.entries(msg.reactions).forEach(([key, value]: any)=>{
                    reactions.push({
                      emoji: this.emojiIt(key),
                      emojiname: key,
                      users: value.usernames.length,
                      ismine: (value.usernames.indexOf(this.chatUser) >=0 ? true : false)
                    })
                  })
                }
                map.push({
                  id: msg._id,
                  msg: msg.msg,
                  user: msg.u.username,
                  createdAt: msg.ts.$date,
                  updatedAt: msg._updatedAt.$date,
                  reactions: (msg.reactions ? reactions : null),
                  attachments: (msg.attachments ? msg.attachments : null)
                });
              }
            });
            //preload photos
            this.loadPhotos(map);

            //sort descending
            map = map.sort((objA, objB) => Number(objA.createdAt) - Number(objB.createdAt));
            resolve(map);
          },
          error: (error)=>{
            console.log(error);
            this.showAlert('Cannot fetch data from Chat Server. Please check your network status.');
          }
        });
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
          error: (error)=>{
            console.log(error);
            this.showAlert('Cannot search to Chat Server. Please check your network status.');
          }
        });
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
          error: (error)=>{
            console.log(error);
            this.showAlert('Cannot search to Chat Server. Please check your network status.');
          }
        });
    });
  }

  getUserInfo(username: string) {
    return new Promise((resolve, reject) => {
      this.http.get('https://' + this.config.CHAT_HOST + '/api/v1/users.info?username=' + username,
        {headers: this.headers})
        .subscribe({
          next: (data: any)=>{
            resolve({name: data.user.name, username: data.user.username, status: data.user.status});    
          },
          error: (error)=>{
            console.log(error);
            this.showAlert('Cannot connect to Chat Server. Please check your network status.');
          }
        });
    });
  }

  markRoomRead(rid: string){
    this.http.post('https://' + this.config.CHAT_HOST + '/api/v1/subscriptions.read',
      {rid: rid},
      {headers: this.headers}).subscribe(()=>{
        this.events.publish('chat:markroomread');
      });
  }

  // Message Reactions
  setReaction(mid: string, emojiname: string, set: boolean){
    this.chatAPI.callMethod("setReaction", emojiname.replace('/:/g',''), mid, set).subscribe({
      next: (data) => {
        if(data.error){
          console.log('Error: ',data)
        }
      },
      error: (error)=>console.log(error)});
  }

  // Upload audio recording as new message
  uploadFile(rid: string, filename: string, filecontent: Blob, description?: string,  filesize?: number, progressel?: any){
    // use REST API
    let headers = new HttpHeaders({
      'X-Auth-Token': this.chatUserToken,
      'X-User-Id': this.chatUserId});

    const formData = new FormData();
    formData.append('file', filecontent, filename);
    formData.append('description', description ? description : "Audio message");

    const request = this.http.post('https://' + this.config.CHAT_HOST + '/api/v1/rooms.upload/' + rid, formData,
      {headers: headers, reportProgress: true, observe: "events"})
      .subscribe({
        next: (ev)=>{
          switch (ev.type) {
           /* case HttpEventType.Sent:
              console.log('Request sent!');
              break;
            case HttpEventType.ResponseHeader:
              console.log('Response header received!');
              break;*/
            case HttpEventType.UploadProgress:
              if(progressel){
                progressel.value = ev.loaded/filesize;
              }
              break;
            case HttpEventType.Response:
              //console.log('Done!', ev.body);
              if(!(ev.body as any).success){
                this.showAlert('Cannot upload to Chat Server. Please check your network status.');
              }
              if(progressel){
                progressel.value = 0;
              }
          }
        },
        error: (error)=>{
          console.log(error);
          if(progressel){
            progressel.value = 0;
          }
          this.showAlert('Cannot upload to Chat Server. Please check your network status.');
        }
      });

      return request;
  }

  downloadFile(fileurl, mimetype){
    let headers = new HttpHeaders({
      'X-Auth-Token': this.chatUserToken,
      'X-User-Id': this.chatUserId,
      'Content-Type': mimetype});

    return new Promise((resolve, reject) => {
      this.http.get('https://' + this.config.CHAT_HOST + fileurl,
        {headers: headers,
          responseType: 'blob'
        })
        .subscribe({
          next: (data: any)=>{
            if(data){
              resolve(data);
            }
          },
          error: (error)=>{
            console.log(error);
            this.showAlert('Cannot download from Chat Server. Please check your network status.');
          }
        });
    });
  }

  //pre-load photos to image_preview field
  loadPhotos(messages, msg?){
    if(messages){
      messages.forEach((msg)=>{
        if(msg.attachments){
          msg.attachments.forEach(async (w)=>{
            if(w.image_type){
              w.image_preview = await this.blobToBase64(await this.downloadFile(w.image_url, w.image_type) as Blob);
            }
          });
        }
      });
    }else{
      if(msg.attachments){
        msg.attachments.forEach(async (w)=>{
          if(w.image_type){
            w.image_preview = await this.blobToBase64(await this.downloadFile(w.image_url, w.image_type) as Blob);
          }
        });
      }
    }
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
      heart: "&#x2764&#xfe0f",
      smiley: "&#x1f604",
      thumbsup: "&#x1f44d",
      slight_frown: "&#x1f641"
    }
    const regExpCleanEmojiname = /:([^:]*):/g
    let result;
    while (result = regExpCleanEmojiname.exec(text)) {
      text = text.replace(result[0], emojiMap[result[1]]);
    }
    if(text == "undefined") {text=""}
    return text;
  }

  blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
  }

  async showAlert(message){
    const toast = await this.toastCtrl.create({
      message: message,
      buttons: [
        {
          icon: 'close',
          htmlAttributes: {
            'aria-label': 'close',
          },
        },
      ],
      position: 'bottom',
      color: "danger"
    });
    await toast.present();
    //toast
    //  .onDidDismiss()
    //  .then(() => this.swUpdate.activateUpdate())
    //  .then(() => window.location.reload());
    
    /*const alert = await this.alertCtrl.create({
      header: 'Error',
      message: message,
      buttons: [
        'Ok',
      ]
    });
    await alert.present();*/
  }

}
