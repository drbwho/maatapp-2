import { ConfigData } from './providers/config-data';
import { ConferenceData } from './providers/conference-data';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { SplashScreen, SplashScreenPlugin } from '@capacitor/splash-screen';

import { MenuController, Platform, ToastController, AlertController, LoadingController } from '@ionic/angular';

import { Storage } from '@ionic/storage';
import { HttpClient, HttpClientModule, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Network } from '@awesome-cordova-plugins/network/ngx';
// import { FCM } from '@ionic-native/fcm/ngx';

import { Events } from './providers/events';
import { UserData } from './providers/user-data';
import { NewsData } from './providers/news-data';

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
    private network: Network,
    private toast: ToastController
    // private fcm: FCM
  ) {
    this.initializeApp();
  }

  async ngOnInit() {
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

  openTutorial() {
    this.menu.enable(false);
    this.storage.set('ion_did_tutorial', false);
    this.router.navigateByUrl('/tutorial');
  }

  // check if new version of conference data exists
  check_new_jsonfile() {
    const headers = new HttpHeaders();
    headers.append('Cache-control', 'no-cache');
    headers.append('Cache-control', 'no-store');
    headers.append('Cache-control', 'max-age=0');
    headers.append('Expires', '0');
    headers.append('Pragma', 'no-cache');

    this.storage.get(this.config.JSON_FILE).then( (res) => {
        this.http
           .get(this.config.API_JSONFILE_URL, {headers})
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
                            console.log('Confirm Cancel: blah');
                          }
                        }, {
                          text: 'Update',
                          handler: async () => {
                            const loading = await this.loadingcontroller.create({
                              message: 'Please wait...'
                            });
                            loading.present();
                            setTimeout(() => {
                              loading.dismiss();
                            }, 3000);
                            this.storage.set(this.config.JSON_FILE, data);
                            this.confdata.processData(res);
                            window.location.reload();
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
                  message: 'Please wait...'
                });
                loading.present();
                setTimeout(() => {
                  loading.dismiss();
                }, 3000);
                this.storage.set(this.config.JSON_FILE, data);
              }
            });
    });
  }


  loadInfoPage (page: any) {
    this.events.publish('info:updated', page);
    this.router.navigate(['/app/tabs/info/' + page], {state: {updateInfos: true}});
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
    // let disconnectSubscription =
    this.network.onDisconnect().subscribe(async () => {
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
    });

    // stop connect watch
    // connectSubscription.unsubscribe();
  }
}
