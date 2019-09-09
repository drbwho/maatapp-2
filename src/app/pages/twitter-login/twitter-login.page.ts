
import { Component } from '@angular/core';
import { TwitterProvider } from './../../providers/twitter-service';
import { TwitterConnect } from '@ionic-native/twitter-connect/ngx';
import { NavController, AlertController, LoadingController } from '@ionic/angular';


@Component({
  selector: 'twitter-login',
  templateUrl: './twitter-login.page.html',
  styleUrls: ['./twitter-login.page.scss'],
})
export class TwitterLoginPage {
  loading: any;

  constructor(
      public navCtrl: NavController,
      private twitter: TwitterConnect,
      private twitterProvider: TwitterProvider,
      private alertCtrl: AlertController,
      private loadingCtrl: LoadingController
  ) { }

  public loginWithTwitter() {
    this.showLoading();
    this.twitter.login().then((data) => {
      this.twitterProvider.setTokens(data.token, data.secret);
      this.loading.dismiss().then(() => {
        this.navCtrl.navigateRoot('TimelinePage');
      });
    }, error => {
      this.showError(error);
    });
  }

  private showLoading() {
    this.loading = this.loadingCtrl.create({
      duration: 5000,
      message: 'Please wait...'
    });
    this.loading.present();
  }

  private showError(text) {
    this.loading.dismiss().then(async () => {
      const alert = await this.alertCtrl.create({
        header: 'Fail',
        message: text + '\nMake sure to setup Twitter account on your device.',
        buttons: ['OK']
      });
      await alert.present();
    });
  }

}
