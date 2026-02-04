import { ConfigData } from './providers/config-data';
import { DataProvider } from './providers/provider-data';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { SplashScreen } from '@capacitor/splash-screen';

import { MenuController, Platform, ToastController, AlertController, LoadingController, ModalController } from '@ionic/angular';

import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Network } from '@capacitor/network';
import { register } from 'swiper/element/bundle';

import { Events } from './providers/events';
import { UserData } from './providers/user-data';
import { Browser } from '@capacitor/browser';
import { TranslateService } from '@ngx-translate/core';

register();

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class AppComponent implements OnInit {
  localversion: any;
  loggedIn = false;
  hasUnreadNews = false;
  hasUnreadChat = 0;
  networkStatus = false;

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
    private dataprovider: DataProvider,
    private config: ConfigData,
    private toast: ToastController,
    private modalCtrl: ModalController,
    private translate: TranslateService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      //this.statusBar.styleDefault();
      SplashScreen.hide();
    });
  }

  ngOnInit() {
    this.storage.create();

    // Create device id
    this.createDeviceId();

    this.checkLoginStatus();
    this.listenForLoginEvents();
    //this.check_new_jsonfile();
    this.userData.loadFavorites();

    this.listenNetworkConnectionEvents();

     // Set default Language or load setting from database
     this.translate.setDefaultLang('en');
     this.storage.get(this.config.APPLICATION_LANGUAGE).then( (lang) => {
       if(lang){
         this.translate.use(lang);
       }
     });

    // PWA updates
    if(this.swUpdate.isEnabled){
      this.swUpdate.checkForUpdate().then(async res => {
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
    }else{
      console.log('Service workers disabled')
    }
  }


  checkLoginStatus() {
    return this.userData.isLoggedIn().then(async loggedIn => {
      if(loggedIn){
        try{
          const res = await this.userData.checkAuth();
          if(res){
           // this.connectToChatService();
          }
          this.updateLoggedInStatus(res as boolean);
        }catch(e){
          this.updateLoggedInStatus(false);
          return false;
        }
      }else{
        this.updateLoggedInStatus(false);
        return false;
      }
    });
  }

  updateLoggedInStatus(loggedIn: boolean) {
    this.storage.set(this.userData.HAS_LOGGED_IN, loggedIn);
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
      this.dataprovider.clear();
    });
  }

  logout() {
    this.translate.get(['confirmation','are_you_sure_logout','no','yes']).subscribe(async (keys: any)=>{
      const alert = await this.alertController.create({
        header: keys['confirmation'],
        message: keys['are_you_sure_logout'],
        buttons: [
          {
            text: keys['no'],
          },
          {
            text: keys['yes'],
            handler: async () => {
              this.userData.logout().then(() => {
                return this.router.navigateByUrl('/home');
              });
            },
          },
        ],
      });
      await alert.present();
    });
  }

  // select current meeting
 /* get_current_meeting(force?:boolean) {
    this.storage.get(this.config.CUR_MEETING).then(async (data)=>{
      if(data && !force){
        return;
      }
      const modal = await this.modalCtrl.create({
        component: SelectMeetingPage,
        componentProps: { }
      });
      await modal.present();
      await modal.onWillDismiss();
      //reload conference data
      //this.check_new_jsonfile();
    })
  }*/

  listenNetworkConnectionEvents() {
    // Check on init
    Network.getStatus().then((status)=>{
      if(status.connected){
        this.networkStatus = true;
      };
    })

    // watch network status
    Network.addListener('networkStatusChange', async status => {
      console.log('Network status changed', status);
      if(status.connected){
        this.events.publish('network:connect');
        this.networkStatus = true;
        /*const toast = await this.toast.create({
          message: 'Network Connected!',
          duration: 2000
        });
        toast.present();*/
      }else{
        this.events.publish('network:disconnect');
        this.networkStatus = false;
        const toast = await this.toast.create({
          message: 'Network disconnected...',
          duration: 2000
        });
        toast.present();
      }
    });
  }

  openExternalUrl(url: string) {
    Browser.open(
      {url: url}
    );
  }

  async user_not_loggedin(){
    this.translate.get(['info','you_must_login_to_gain_access','login','cancel']).subscribe(async (keys: any)=>{
      const alert = await this.alertController.create({
        header: keys['info'],
        message: keys['you_must_login_to_gain_access'],
        buttons: [
        {
          text: keys['login'],
          handler: () => {
            console.log('Not logged in');
            this.router.navigate(['/login']);
            }
          },
          {
          text: keys['cancel'],
          handler: () => {
            alert.dismiss();
            }
          }
        ]
      });
      await alert.present();
    });
  }

  // Create a unique device id
  createDeviceId(){
    this.storage.get(this.config.DEVICE_ID).then(data => {
      if(!data){
        const id = (Math.random().toString(36)+'00000000000000000').slice(2, 15 + 2);
        this.storage.set(this.config.DEVICE_ID, id);
      }
    });
  }
}
