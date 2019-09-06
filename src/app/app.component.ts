import { ConferenceData } from './providers/conference-data';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';

import { Events, MenuController, Platform, ToastController, AlertController, LoadingController } from '@ionic/angular';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Storage } from '@ionic/storage';
import { HttpClient, HttpClientModule, HttpRequest, HttpHeaders } from '@angular/common/http';

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

  constructor(
    private events: Events,
    private menu: MenuController,
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: Storage,
    private http: HttpClient,
    public alertController: AlertController,
    public loadingcontroller: LoadingController,
    private userData: UserData,
    private swUpdate: SwUpdate,
    private toastCtrl: ToastController,
    private confdata: ConferenceData,
    private newsdata: NewsData
  ) {
    this.initializeApp();
  }

  async ngOnInit() {
    this.checkLoginStatus();
    this.listenForLoginEvents();
    this.check_new_jsonfile();
    this.userData.loadFavorites();
    this.newsdata.loadNews();

    // check in background for news
    setInterval(
      () => {
        this.newsdata.check_news(this.http);
      },
      10000
    );

    this.swUpdate.available.subscribe(async res => {
      const toast = await this.toastCtrl.create({
        message: 'Update available!',
        showCloseButton: true,
        position: 'bottom',
        closeButtonText: `Reload`
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
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
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
      return this.router.navigateByUrl('/app/tabs/schedule');
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
    headers.append('Expires', '0');
    headers.append('Pragma', 'no-cache');

    this.storage.get(this.confdata.JSON_FILE).then( (res) => {
        this.http
           .get(this.confdata.API_JSONFILE_URL, {headers})
           .subscribe( async (data: any) => {
              if (res) {
                if (res.version < data.version) {
                    const alert = await this.alertController.create({
                      header: 'Information',
                      message: 'New Conference Data <strong>Available</strong>!',
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
                          handler: () => {
                            this.storage.set(this.confdata.JSON_FILE, data);
                            console.log('Confirm Okay');
                          }
                        }
                      ]
                    });
                    await alert.present();
                }
              } else {
                const loading = await this.loadingcontroller.create({
                  message: 'Please wait...'
                });
                loading.present();
                setTimeout(() => {
                  loading.dismiss();
                }, 2000);
                this.storage.set(this.confdata.JSON_FILE, data);
              }
            });
    });
  }


  loadInfoPage (page: any) {
    this.events.publish('info:updated', page);
    this.router.navigate(['/app/tabs/info/' + page], {state: {updateInfos: true}});
  }

}
