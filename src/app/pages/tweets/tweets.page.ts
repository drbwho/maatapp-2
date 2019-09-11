import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tweets',
  templateUrl: './tweets.page.html',
  styleUrls: ['./tweets.page.scss'],
})
export class TweetsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }
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
  public composeTweet() {
    let prompt = this.alertCtrl.create({
      title: 'New Tweet',
      message: "Write your Tweet message below",
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
    prompt.present();
  }
  public dateForTweet(dateString) {
    let d = new Date(Date.parse(dateString));
 
    // http://stackoverflow.com/questions/3552461/how-to-format-a-javascript-date
    var datestring = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
      d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
 
    return datestring;
  }
 
  public openLinkUrl(url) {
    let browser = this.iab.create(url, 'blank');
  }
 
  public postTweet(text) {
    this.showLoading();
    this.twitterProvider.postTweet(text).subscribe(res => {
      this.loading.dismiss();
      let toast = this.toastCtrl.create({
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
      content: 'Please wait...'
    });
    this.loading.present();
  }
 
  private showError(text) {
    this.loading.dismiss();
    let alert = this.alertCtrl.create({
      title: 'Error',
      message: text,
      buttons: ['OK']
    });
    alert.present(prompt);
  }
 
}
