import { AfterViewInit, Component, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { AlertController } from '@ionic/angular';

import { UserData } from '../../providers/user-data';
import { TranslateService } from '@ngx-translate/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'page-account',
    templateUrl: 'account.html',
    styleUrls: ['./account.scss'],
    standalone: false
})
export class AccountPage implements AfterViewInit {
  user =
    {
      username: '',
      uid: 0,
      img: '',
      fname: '',
      lname: '',
      org: '',
      email: '',
      city: '',
      country: '',
      photo: null
    };
  role = "";

  constructor(
    public alertCtrl: AlertController,
    public router: Router,
    public userData: UserData,
    private translate: TranslateService,
    private modalCtrl: ModalController
  ) { }

  ngAfterViewInit() {
    this.getUser();
  }

  updatePicture() {
    console.log('Clicked to update picture');
  }

  // Present an alert with the current username populated
  // clicking OK will update the username and display it
  // clicking Cancel will close the alert and do nothing
  async changeUsername() {
    const alert = await this.alertCtrl.create({
      header: 'Change Username',
      buttons: [
        'Cancel',
        {
          text: 'Ok',
          handler: (data: any) => {
            this.userData.setUsername(data.username);
            this.getUser();
          }
        }
      ],
      inputs: [
        {
          type: 'text',
          name: 'username',
          value: this.user.username,
          placeholder: 'username'
        }
      ]
    });
    await alert.present();
  }

  getUser() {
    this.userData.getUser().then((user: any) => {
      this.user = user;
      switch(user.role){
        case 1:
          this.role = 'Farmer';
          break;
        case 2:
          this.role = 'Leader';
          break;
        case 3:
          this.role = 'Manager';
          break;
        case 4:
          this.role = 'Administrator';
          break;
      }
    });
  }

  changePassword() {
    console.log('Clicked to change password');
  }

  logout() {
    this.translate.get(['confirmation','are_you_sure_logout','no','yes']).subscribe(async (keys: any)=>{
      const alert = await this.alertCtrl.create({
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
                return this.router.navigateByUrl('/login');
              });
            },
          },
        ],
      });
      await alert.present();
    });
  }

  support() {

  }

  dismiss() {console.log('dismiss');
    this.modalCtrl.dismiss();
  }

  startMeeting(){

  }

  openSettings(){

  }

  openSupport(){
    this.router.navigateByUrl('/support');
  }

  openAbout(){

  }
}
