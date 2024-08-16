import { Platform } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { DataProvider } from '../../providers/provider-data';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { Events } from '../../providers/events';
import { AppComponent } from '../../app.component';
import { ConfigData } from '../../providers/config-data';
import { Browser } from '@capacitor/browser';
import { AlertController } from '@ionic/angular';
import { UserData } from '../../providers/user-data';

@Component({
  selector: 'home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage implements OnInit {
  conftitle: string;
  backimage: string;
  confpage: string;

  constructor(
    private events: Events,
    private router: Router,
    public dataProvider: DataProvider,
    public plt: Platform,
    private appComponent: AppComponent,
    private config: ConfigData,
    private storage: Storage,
    private alertController: AlertController,
    private userData: UserData
    ) { }

  async ngOnInit() {
    if (this.plt.width() > 500) {
      this.backimage = '/assets/img/Start_BG_screen_without_logo_flat.jpg';
    } else {
      this.backimage = '/assets/img/8-sm.png';//Start_BG_screen_without_logo.jpg';
    }
  }

  loadPage (target: any) {
    // restrict access
    this.userData.isLoggedIn().then((value)=>{
        if(!value){
          this.user_not_loggedin();
        }else{
          this.router.navigate([target], {state: {updateInfos: true}});
        }
      });

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

  openExternalUrl(url: string) {
    Browser.open(
      {url: url}
    )
  }

}
