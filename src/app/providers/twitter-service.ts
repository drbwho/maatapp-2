import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';
import { promise } from 'protractor';

@Injectable({
  providedIn: 'root'
})
export class TwitterService {
  urlLink_timeline = 'https://api.twitter.com/1.1/statuses/user_timeline.json?count=20&screen_name=';
  urlLink_token = 'https://api.twitter.com/oauth2/token';
  oauth_consumer_key = 'TyIOYJ7He8PbhP5iaOaSoNgRl';
  consumerSecret = 'qFJ265oOVpU3PQrz6ogpM5iMVws0QCQ89ePC1bR6xqheklrLCC';
/*
  const oauth_token = '1168161377346867200-IsbPqVbtdcouSNWGTriHZ9XlSceSI0';
  const tokenSecret = 'YNgiiXMjkPhDH777A137tvoCkEp4glwxRsnjFBZ1bwss9';
*/
  auth_token: string;

  constructor(public nativeHttp: HTTP) { }

  async getToken() {
    const b64 = btoa(this.oauth_consumer_key + ':' + this.consumerSecret);
    const body = 'grant_type=client_credentials';

    this.nativeHttp.setDataSerializer( 'utf8' );
    this.nativeHttp.setHeader('*', 'Accept', 'application/json');
    this.nativeHttp.setHeader('*', 'Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
    this.nativeHttp.setHeader('*', 'Authorization', 'Basic ' + b64);

    const res = await this.nativeHttp.post(this.urlLink_token, body, {});
    const data = JSON.parse(res.data);
    console.log('Token' + data.access_token);
    return data.access_token;
  }

  // get timeline of specific user (twitter name)
  getUserTimeline(user): Promise<any> {

    if (this.auth_token) {
      this.nativeHttp.setHeader('*', 'Authorization', 'Bearer ' + this.auth_token);
      this.nativeHttp.setHeader('*', 'Content-Type', 'application/json');
      return this.nativeHttp.get(this.urlLink_timeline + user, '', {}).then( (reslt: any) => {
        return reslt.data;
      });
     } else {

        const dat: any = this.getToken().then( tok => {
          this.auth_token = tok;
          this.nativeHttp.setHeader('*', 'Authorization', 'Bearer ' + this.auth_token);
          this.nativeHttp.setHeader('*', 'Content-Type', 'application/json');
          return this.nativeHttp.get(this.urlLink_timeline + user, '', {});
        });
        return Promise.all([dat]).then( (reslt: any) => {
          return reslt[0].data;
        });
      }
    }


  postTweet(text) {
    return this.nativeHttp.post('', '', {});
  }
}
