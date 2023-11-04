import { ConfigData } from './providers/config-data';
import { ConferenceData } from './providers/conference-data';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { SplashScreen } from '@capacitor/splash-screen';

import { MenuController, Platform, ToastController, AlertController, LoadingController } from '@ionic/angular';

import { Storage } from '@ionic/storage';
import { HttpClient, HttpClientModule, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Network } from '@capacitor/network';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { register } from 'swiper/element/bundle';
import {PushNotifications, Token} from '@capacitor/push-notifications';

// For Web push notifications
import { Capacitor } from "@capacitor/core";
import { environment } from "../environments/environment";
import { initializeApp } from "firebase/app";
import {
  FirebaseMessaging,
  GetTokenOptions,
} from "@capacitor-firebase/messaging";


import { Events } from './providers/events';
import { UserData } from './providers/user-data';
import { NewsData } from './providers/news-data';

register();

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit {
  localversion: any;

  appPages = [
    {
      title: 'Program',
      url: '/app/tabs/program',
      icon: 'calendar'
    },
    {
      title: 'Speakers',
      url: '/app/tabs/speakers',
      icon: 'contacts'
    },
    {
      title: 'Map',
      url: '/app/tabs/map',
      icon: 'map'
    },
    {
      title: 'About',
      url: '/app/tabs/about',
      icon: 'information-circle'
    }
  ];
  loggedIn = false;
  hasUnreadNews = false;

  constructor(
    private events: Events,
    private menu: MenuController,
    private platform: Platform,
    private router: Router,
    private storage: Storage,
    private http: HttpClient,
    public alertController: AlertController,
    public loadingcontroller: LoadingController,
    private userData: UserData,
    private swUpdate: SwUpdate,
    private toastCtrl: ToastController,
    private confdata: ConferenceData,
    private newsdata: NewsData,
    private config: ConfigData,
    private toast: ToastController,
    private inAppBrowser: InAppBrowser
  ) {
    this.initializeApp();
  }

  ngOnInit() {
    this.storage.create();
    
    this.checkLoginStatus();
    this.listenForLoginEvents();
    this.check_new_jsonfile();
    this.userData.loadFavorites();
    this.listenForNewsEvents();
    this.newsdata.loadNews();
    this.confdata.loadSessionsRatings();
    this.confdata.loadMySessionsRatings();

    // this.listenNetworkConnectionEvents();

    // check in background for news and session ratings
    setInterval(
      () => {
        this.newsdata.check_news(this.http);
        this.confdata.getRemoteSessionsRatings(this.http);
        this.confdata.postSessionRatings(this.http);
      },
      10000
    );

    // load status from storage
    this.load_hasUnreadNews();

    this.swUpdate.available.subscribe(async res => {
      const toast = await this.toastCtrl.create({
        message: 'Update available!',
        buttons: ['Close', 'Reload'],
        position: 'bottom',
      });

      await toast.present();

      toast
        .onDidDismiss()
        .then(() => this.swUpdate.activateUpdate())
        .then(() => window.location.reload());
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      //this.statusBar.styleDefault();
      SplashScreen.hide();
    });

    if (this.config.ENABLE_PUSH_NOTIFICATIONS) {
      if (Capacitor.isNativePlatform()) {
        console.log('Native platform');
        this.register_native_push_notifications();
      }else{
        console.log('Web platform');
        this.register_web_push_notifications();
      }
    }

    // firebase push notifications
    /*if (this.config.ENABLE_PUSH_NOTIFICATIONS) {
      this.fcm.getToken().then(token => {
        console.log(token);
      });
      this.fcm.onTokenRefresh().subscribe(token => {
        console.log(token);
      });
      this.fcm.onNotification().subscribe(notification => {
        console.log(notification);
        const navigationExtras: NavigationExtras = {
          queryParams: {
            special: JSON.stringify(notification)
          }
        };
        if (notification.wasTapped) {
          console.log('Received in background');
        } else {
          console.log('Received in foreground');
        }
        // this.router.navigate(['/app/tabs/notifications'], navigationExtras);
        this.router.navigate(['/app/tabs/notifications', JSON.stringify(notification)]);
      });
      // this.fcm.subscribeToTopic('people'); /topics/all
    }*/
  }

  checkLoginStatus() {
    return this.userData.isLoggedIn().then(loggedIn => {
      return this.updateLoggedInStatus(loggedIn);
    });
  }

  updateLoggedInStatus(loggedIn: boolean) {
    setTimeout(() => {
      this.loggedIn = loggedIn;
    }, 300);
  }

  listenForLoginEvents() {
    this.events.subscribe('user:login', () => {
      this.updateLoggedInStatus(true);
    });

    this.events.subscribe('user:signup', () => {
      this.updateLoggedInStatus(true);
    });

    this.events.subscribe('user:logout', () => {
      this.updateLoggedInStatus(false);
    });
  }

  logout() {
    this.userData.logout().then(() => {
      return this.router.navigateByUrl('/home');
    });
  }


  // check if new version of conference data exists
  async check_new_jsonfile() {
    const headers = new HttpHeaders();
    headers.append('Cache-control', 'no-cache');
    headers.append('Cache-control', 'no-store');
    headers.append('Cache-control', 'max-age=0');
    headers.append('Expires', '0');
    headers.append('Pragma', 'no-cache');
    
    this.storage.get(this.config.JSON_FILE).then( (res) => {
        // trick to disable response caching
        const salt = (new Date()).getTime();
        this.http
           .get(this.config.API_JSONFILE_URL + '?' + salt, {headers})
           .subscribe( async (data: any) => {
              if (res) {
                if (res.version < data.version) {
                    const alert = await this.alertController.create({
                      header: 'Update available!',
                      message: 'New Conference Data <strong>Available</strong>! Do you want to update now?',
                      buttons: [
                        {
                          text: 'Ignore',
                          role: 'cancel',
                          cssClass: 'secondary',
                          handler: (blah) => {
                            console.log('Confirm Cancel: Update');
                          }
                        }, {
                          text: 'Update',
                          handler: async () => {
                            const loading = await this.loadingcontroller.create({
                              message: 'Updating<br/>Please wait...'
                            });
                            loading.present();
                            setTimeout(() => {
                              loading.dismiss();
                            }, 3000);
                            this.storage.set(this.config.JSON_FILE, data).then(()=>{
                              this.confdata.processData(data);
                            });
                          }
                        }
                      ]
                    });
                    await alert.present();
                } else {
                  this.confdata.processData(res);
                }
              } else {
                const loading = await this.loadingcontroller.create({
                  message: 'Updating<br/>Please wait...'
                });
                loading.present();
                setTimeout(() => {
                  loading.dismiss();
                }, 3000);
                this.storage.set(this.config.JSON_FILE, data).then(()=>{
                  this.confdata.processData(data);
                });
              }
            },
            async (error) => {
              console.log("Network Error!");
              const toast = await this.toast.create({
                message: 'Network error! Cannot check for updates...',
                cssClass: 'toast-alert',
                duration: 5000
              });
              toast.present();
            });
    });
  }

  loadInfoPage (page: any) {
    // restrict access
    if(page == 'bookofabstracts'){
      this.userData.isLoggedIn().then((value)=>{
        if(!value){
          this.user_not_loggedin();
        }else{
          this.events.publish('info:updated', page);
          this.router.navigate(['/app/tabs/info/' + page], {state: {updateInfos: true}});
        }
      });
    }else{
      this.events.publish('info:updated', page);
      this.router.navigate(['/app/tabs/info/' + page], {state: {updateInfos: true}});
    }
  }

  loadTaxonomyPage (page: any) {
    this.events.publish('taxonomy:updated', page);
    this.router.navigate(['/app/tabs/taxonomy/type/' + page], {state: {updateInfos: true}});
  }

  listenForNewsEvents() {
    this.events.subscribe('user:unreadnews', (status: boolean) => {
      this.hasUnreadNews = status;
      this.storage.set(this.config.HAS_UNREAD_NEWS, status);
    });
  }

  load_hasUnreadNews() {
    this.storage.get(this.config.HAS_UNREAD_NEWS).then( (res) => {
      if (res === null) { this.hasUnreadNews = false;
      } else {  this.hasUnreadNews = res; }
    })
    .catch ((errorGet: any) => {
      console.error(errorGet);
      this.hasUnreadNews = false;
    });
  }

  listenNetworkConnectionEvents() {
    // watch network for a disconnection

    Network.addListener('networkStatusChange', async status => {
      console.log('Network status changed', status);
      if(status.connected){
        const toast = await this.toast.create({
          message: 'Network Connected!',
          duration: 2000
        });
        toast.present();
      }else{
        const toast = await this.toast.create({
          message: 'Network disconnected...',
          duration: 2000
        });
        toast.present();
      }
    });

    // let disconnectSubscription =
   /* Network.onDisconnect().subscribe(async () => {
      console.log('network was disconnected :-(');
      const toast = await this.toast.create({
        message: 'Network disconnected...',
        duration: 2000
      });
      toast.present();
    });

    // stop disconnect watch
    // disconnectSubscription.unsubscribe();


    // watch network for a connection
    // let connectSubscription =
    this.network.onConnect().subscribe(() => {
      console.log('network connected!');
      // We just got a connection but we need to wait briefly
      // before we determine the connection type. Might need to wait.
      // prior to doing any api requests as well.
      setTimeout(async () => {
        if (this.network.type === 'wifi') {
          console.log('we got a wifi connection, woohoo!');
          const toast = await this.toast.create({
            message: 'Network Connected!',
            duration: 2000
          });
          toast.present();
        }
      }, 3000);
    });*/

    // stop connect watch
    // connectSubscription.unsubscribe();
  }

  openExternalUrl(url: string) {
    this.inAppBrowser.create(
      url,
      '_blank'
    );
  }

  openConfLink(){
    this.openExternalUrl('https://twitter.com/' + this.confdata.data.info[0].twitter);
  }

  async user_not_loggedin(){
    const alert = await this.alertController.create({
      header: 'Info',
      message: 'You must login to gain access',
      buttons: [
        {
        text: 'Login',
        handler: () => {
          console.log('Not logged in');
          this.router.navigate(['/login']);
          }
        },
        {
        text: 'Cancel',
        handler: () => {
          alert.dismiss();
          }
        }
      ]
    });
    await alert.present();
  }

  receive_notification(notification){
    this.router.navigate(['/app/tabs/notifications', JSON.stringify({title: notification.title, body: notification.body})]);
  }

  // Register Firebase Push Notifications for Web 
  public async register_web_push_notifications(): Promise<void> {
    initializeApp(environment.firebase);

    this.getToken().then((token)=>{
      console.log('Token: '+ token);
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
  }

  // Register Native Push Notifications 
  public async register_native_push_notifications(){ 

    PushNotifications.addListener('registration', token => {
      console.info('Registration token: ', token.value);
    });

    PushNotifications.addListener('registrationError', err => {
      console.error('Registration error: ', err.error);
    });

    PushNotifications.addListener('pushNotificationReceived', notification => {
      console.log('Push notification received: ', notification);
      this.receive_notification(notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', notification => {
      console.log('Push notification action performed: ', notification.actionId, notification);
      
    });

    // Check permissions
    //let permStatus = await PushNotifications.checkPermissions();
    PushNotifications.requestPermissions().then(permStatus => {
      if (permStatus.receive === 'granted') {
        PushNotifications.register();
      }else{
        throw new Error('User denied permissions!');
      }
    });

    PushNotifications.getDeliveredNotifications().then(notificationList => {
        console.log('delivered notifications', notificationList);
    });
      
  }

}
