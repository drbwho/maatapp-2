import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController, LoadingController } from '@ionic/angular';

import { AlertController, Platform } from '@ionic/angular';

import { UserData } from '../../providers/user-data';
import { TranslateService } from '@ngx-translate/core';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';

@Component({
    selector: 'app-profile',
    templateUrl: 'profile.page.html',
    styleUrls: ['./profile.page.scss'],
    standalone: false
})
export class ProfilePage implements OnInit {
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
      country: null,
      photo: null
    };
  role = "";
  appinfo = null;
  http_host = null;

  constructor(
    public alertCtrl: AlertController,
    public router: Router,
    public userData: UserData,
    private translate: TranslateService,
    private modalCtrl: ModalController,
    private platform: Platform,
    private actionSheetCtrl: ActionSheetController,
    private storage: Storage,
    private loadingcontroller: LoadingController,
    private config: ConfigData
  ) { }

  async ngOnInit() {
    await this.getUser();
    if (this.platform.is('hybrid')) { // device
      this.appinfo = await App.getInfo();
    }
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
                this.modalCtrl.dismiss();
                return this.router.navigateByUrl('/', { replaceUrl: true});
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

  dismiss() {
    this.modalCtrl.dismiss();
  }

  startMeeting(){
    this.dismiss();
    this.router.navigateByUrl('/new-meeting');
  }

  openSettings(){

  }

  openSupport(){
    this.dismiss();
    this.router.navigateByUrl('/support');
  }

  openAbout(){
    this.dismiss();
    this.router.navigateByUrl('/about');
  }


  async changePhoto(){
    this.translate.get(['select_profile_picture','camera','photo_collection','cancel']).subscribe(async (keys: any)=>{
      const actionSheet = await this.actionSheetCtrl.create({
        header: keys['select_profile_picture'],
        buttons: [
        {
          text: keys['camera'],
          icon: 'camera-outline',
          handler: () => {
            this.takePicture(CameraSource.Camera);
          }
        },
        {
          text: keys['photo_collection'],
          icon: 'image-outline',
          handler: () => {
            this.takePicture(CameraSource.Photos);
          }
        },
        {
          text: keys['cancel'],
          icon: 'close',
          role: 'cancel'
        }
        ]
      });
      await actionSheet.present();
    })
  }

  async takePicture(source: CameraSource) {
    let loading = await this.loadingcontroller.create({showBackdrop: false});
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        width: 800,  // Resize
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: source
      });

      loading.present();

      // Convert to file
      const response = await fetch(image.webPath!);
      const blob = await response.blob();
      let imageFile = new File([blob], `profile_${Date.now()}.jpg`, { type: 'image/jpeg' });

      this.userData.updateProfilePhoto(imageFile).then((res: any) => {
        this.user.photo = res.url;
        this.storage.set(this.userData.USER_FILE, this.user);
        loading.dismiss();
      })
    } catch (error) {
      console.error('cancelled:', error);
      loading.dismiss();
    }
  }

}
