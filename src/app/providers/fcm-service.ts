import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {ActionPerformed, PushNotifications, PushNotificationSchema, Token} from '@capacitor/push-notifications';

// For Web push notifications
import { Capacitor } from "@capacitor/core";
import { environment } from '../../environments/environment';

import { ConfigData } from './config-data';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class FcmService {

  constructor(
    private config: ConfigData,
    private router: Router,
    private http: HttpClient,
    private storage: Storage
  ) { }

  initService() {
    if (this.config.ENABLE_PUSH_NOTIFICATIONS) {
      if (Capacitor.isNativePlatform()) {
        console.log('Native platform');
        this.register_native_push_notifications();
      }else{
        console.log('Web platform - FCM disabled');
       // this.register_web_push_notifications();
      }
    }
  }

  receive_notification(notification){
    //its a chat notification
    if(notification.message){
      this.router.navigate(['/app/tabs/chat-rooms/']);
    //its a general notification
    }else{
      this.router.navigate(['/app/tabs/notifications', JSON.stringify({title: notification.title, body: notification.body})]);
    }
  }

  // Register Firebase Push Notifications for Web 
/*  public async register_web_push_notifications(): Promise<void> {
    initializeApp(environment.firebase);

    this.getToken().then((token)=>{
      console.log('Token: '+ token);
      this.chatService.chatPushToken = token;
    })

    FirebaseMessaging.addListener("notificationReceived", (event) => {
      console.log("notificationReceived: ", { event });
    });
    FirebaseMessaging.addListener("notificationActionPerformed", (event) => {
      console.log("notificationActionPerformed: ", { event });
    });
    navigator.serviceWorker.addEventListener("message", (event: any) => {
      console.log("serviceWorker message: ", { event });
      const notification = new Notification(event.data.notification.title, {
        body: event.data.notification.body,
      });
      notification.onclick = (event) => {
        console.log("notification clicked: ", { event });
        this.receive_notification(notification);
      };
    });
  }

  public async requestPermissions(): Promise<void> {
    await FirebaseMessaging.requestPermissions();
  }

  public async getToken(): Promise<string> {
    const options: GetTokenOptions = {
      vapidKey: environment.firebase.vapidKey,
    };
    options.serviceWorkerRegistration =
      await navigator.serviceWorker.register("firebase-messaging-sw.js");
    
    const { token } = await FirebaseMessaging.getToken(options);
    return token;
  }*/

  // Register Native Push Notifications 
  public async register_native_push_notifications(){ 

    await PushNotifications.addListener('registration', (token: Token) => {
      console.info('Registration token: ', token.value);
      this.register_device(token.value);
    });

    await PushNotifications.addListener('registrationError', err => {
      console.error('Registration error: ', err.error);
    });

    await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push notification received: ', notification);
      this.receive_notification(notification);
    });

    await PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('Push notification action performed: ', action.actionId, action.notification);
      // IMPORTANT: Message body and title must by passed as extra payload (key-value).
      // Notification title and body are not accessible by capacitor app in background
      this.receive_notification(action.notification.data);
    });

    // Check permissions
    //let permStatus = await PushNotifications.checkPermissions();
    await PushNotifications.requestPermissions().then(permStatus => {
      if (permStatus.receive === 'granted') {
        PushNotifications.register();
      }else{
        throw new Error('User denied permissions!');
      }
    });
  }

  //Register FCM token to System
  async register_device(token){
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
      const device_id = await this.storage.get(this.config.DEVICE_ID);
      //register with API
      return new Promise((resolve)=>{        
        this.http.post(this.config.API_FCM_URL, {"device_id": device_id, "fcm_token": token}, {headers: headers})
        .subscribe({ 
          next: (data: any) => {
            console.log(data);
            resolve(null);
          },
          error: async (error) => {
            console.log("Network Error in registering device fcm token!");
            resolve(null);
          }
        });
     });
  }
}
