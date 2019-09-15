import { ConferenceData } from './../../providers/conference-data';
import { TwitterService } from './../../providers/twitter-service';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tweets',
  templateUrl: './tweets.page.html',
  styleUrls: ['./tweets.page.scss'],
})
export class TweetsPage implements OnInit {
  tweets: any;
  loading: any;
  conftwitter: any;

  constructor(
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public toastCtrl: ToastController,
    public twitterProvider: TwitterService,
    public dataProvider: ConferenceData
  ) { }

  ngOnInit() {
    this.dataProvider.load().subscribe((data: any) => {
      if (data && data.eventdates) {
          this.conftwitter = data.info[0].twitter;
        }
      });
  }

  ionViewWillEnter() {
    this.loadUserTimeline();
  }

  public async loadUserTimeline(refresher?) {
    this.loading = this.showLoading();
    this.twitterProvider.getUserTimeline(this.conftwitter).then( async data => {
       this.tweets = JSON.parse(data);
       (await this.loading).dismiss();
      if ( refresher) { refresher.target.complete(); }
    }, err => {
      if ( refresher) { refresher.target.complete(); }
      this.showError(err.message);
    });
  }
  public async composeTweet() {
    const prompt = await this.alertCtrl.create({
      header: 'New Tweet',
      message: 'Write your Tweet message below',
      inputs: [
        {
          name: 'text'
        },
      ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Tweet',
          handler: data => {
            this.postTweet(data.text);
          }
        }
      ]
    });
    await prompt.present();
  }
  public dateForTweet(dateString) {
    const d = new Date(Date.parse(dateString));

    // http://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
    const datestring = ('0' + d.getDate()).slice(-2) + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
      d.getFullYear() + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);

    return datestring;
  }

  public openLinkUrl(url) {
    const browser = window.open(url, 'blank');
  }

  public postTweet(text) {
    this.showLoading();
    this.twitterProvider.postTweet(text).then(async res => {
      // this.loading.dismiss();
      const toast = await this.toastCtrl.create({
        message: 'Tweet posted!',
        duration: 3000
      });
      await toast.present();
    }, err => {
      this.showError(err);
    });
  }

  private async showLoading() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });
    await loading.present();
    return loading;
  }

  private async showError(text) {
    (await this.loading).dismiss();
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: text,
      buttons: ['OK']
    });
    await alert.present();
  }

}
