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
import { NEVER } from 'rxjs';

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
    private modalCtrl: ModalController
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
    });
  }

  logout() {
    this.userData.logout().then(() => {
      return this.router.navigateByUrl('/home');
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

  // check if new version of conference data exists
  /*async check_new_jsonfile() {
    const headers = new HttpHeaders();
    headers.append('Cache-control', 'no-cache');
    headers.append('Cache-control', 'no-store');
    headers.append('Cache-control', 'max-age=0');
    headers.append('Expires', '0');
    headers.append('Pragma', 'no-cache');

    // first check if is current meeting selected?
    let curmeet = await this.storage.get(this.config.CUR_MEETING);
    if(!curmeet){
      this.get_current_meeting(true);
      return;
    }
    this.storage.get(this.config.JSON_FILE).then( (res) => {
        // trick to disable response caching
        const salt = (new Date()).getTime();
        this.http
           .get(this.config.API_JSONFILE_URL + '/' + curmeet.id + '?' + salt, {headers})
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
                              this.dataprovider.processData(data);
                            });
                          }
                        }
                      ]
                    });
                    await alert.present();
                } else {
                  this.dataprovider.processData(res);
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
                  this.dataprovider.processData(data);
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
  }*/

  loadInfoPage (infotype: any) {
    // restrict access
    if(infotype == 'bookofabstracts'){
      this.userData.isLoggedIn().then((value)=>{
        if(!value){
          this.user_not_loggedin();
        }else{
          this.events.publish('info:updated', infotype);
          this.router.navigate(['/app/tabs/info/' + infotype], {state: {updateInfos: true}});
        }
      });
    }else{
      this.events.publish('info:updated', infotype);
      this.router.navigate(['/app/tabs/info/' + infotype], {state: {updateInfos: true}});
    }
  }

  loadTaxonomyPage (page: any) {
    this.events.publish('taxonomy:updated', page);
    this.router.navigate(['/app/tabs/taxonomy/type/' + page], {state: {updateInfos: true}});
  }


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

  openConfLink(){
    this.openExternalUrl('https://twitter.com/' + this.dataprovider.data.info[0].twitter);
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
