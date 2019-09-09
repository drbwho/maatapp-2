import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { Component } from '@angular/core';
import { TwitterProvider } from './../../providers/twitter-service';
import { NavController, LoadingController, AlertController, ToastController } from '@ionic/angular';
import { Ng4TwitterTimelineService } from 'ng4-twitter-timeline/lib/index';

@Component({
  selector: 'twitter-timeline',
  templateUrl: './twitter-timeline.page.html',
  styleUrls: ['./twitter-timeline.page.scss'],
})

export class TwitterTimelinePage {
  tweets: any;
  loading: any;

  constructor(private ng4TwitterTimelineService: Ng4TwitterTimelineService) {
  }


/*
  constructor(
    public navCtrl: NavController,
    private twitterProvider: TwitterProvider,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private iab: InAppBrowser
    ) {}

  ionViewWillEnter() {
    this.loadTimeline();
  }

  public loadTimeline(refresher?) {
    this.showLoading();
    this.tweets = this.twitterProvider.getHomeTimeline();
    this.tweets.subscribe(data => {
      this.loading.dismiss();
      refresher.complete();
    }, err => {
      refresher.complete();
      this.showError(err);
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
    const browser = this.iab.create(url, 'blank');
  }

  public postTweet(text) {
    this.showLoading();
    this.twitterProvider.postTweet(text).subscribe(async res => {
      this.loading.dismiss();
      const toast = await this.toastCtrl.create({
        message: 'Tweet posted!',
        duration: 3000
      });
      toast.present();
    }, err => {
      this.showError(err);
    });
  }
  private showLoading() {
    this.loading = this.loadingCtrl.create({
      message: 'Please wait...'
    });
    this.loading.present();
  }

  private async showError(text) {
    this.loading.dismiss();
    const alert = await this.alertCtrl.create({
      header: 'Error',
      message: text,
      buttons: ['OK']
    });
    alert.present();
  }
*/
}

