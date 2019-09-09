import { TwitterService } from 'ng2-twitter';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

@Injectable()
export class TwitterProvider {
  token = null;
  tokenSecret = null;
  consumerKey = 'YOURCONSUMERKEY';
  consumerSecret = 'YOURCONSUMERSECRET';

  constructor(private twitter: TwitterService) { }

  setTokens(token, tokenSecret) {
    this.token = token;
    this.tokenSecret = tokenSecret;
  }

  postTweet(text) {
    return this.twitter.post(
      'https://api.twitter.com/1.1/statuses/update.json',
      {
        status: text
      },
      {
        consumerKey: this.consumerKey,
        consumerSecret: this.consumerSecret
      },
      {
        token: this.token,
        tokenSecret: this.tokenSecret
      }
    )
      .map(res => res.json());
  }

  getHomeTimeline() {
    return this.twitter.get(
      'https://api.twitter.com/1.1/statuses/home_timeline.json',
      {
        count: 10
      },
      {
        consumerKey: this.consumerKey,
        consumerSecret: this.consumerSecret
      },
      {
        token: this.token,
        tokenSecret: this.tokenSecret
      }
    )
      .map(res => res.json());
  }

}
