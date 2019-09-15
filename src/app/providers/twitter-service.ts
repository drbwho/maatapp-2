import { Platform } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';

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

  constructor(public nativeHttp: HTTP, public http: HttpClient, public plt: Platform) { }

 getUserTimeline(user) {
    const plats = this.plt.platforms();
    if (this.plt.is('mobileweb')) {
      return this.getUserTimeline_web(user);
    } else {
      return this.getUserTimeline_native(user);
    }
 }

 // browser
 async getToken_web() {
    const b64 = btoa(this.oauth_consumer_key + ':' + this.consumerSecret);
    const body = 'grant_type=client_credentials';

  const headers = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    'Authorization': 'Basic ' + b64
  });

  return this.http.post(this.urlLink_token, body, {headers: headers}).subscribe ( (res: any) => {
    const data = JSON.parse(res.data);
    console.log('Token' + data.access_token);
    return data.access_token;
  });
 }

 // device
 async getToken_native() {
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

  // browser
  // get timeline of specific user (twitter name)
  getUserTimeline_web(user): Promise<any> {
    if (this.auth_token) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.auth_token
      });
      return (this.http.get(this.urlLink_timeline, {headers: headers})).toPromise().then ( (reslt: any) => {
        return reslt.data;
      });
    } else {
      return this.getToken_web().then ( (tok: any) => {
        this.auth_token = tok;
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.auth_token
        });
        return (this.http.get(this.urlLink_timeline, {headers: headers})).toPromise().then ( (reslt: any) => {
          return reslt.data;
        });
      });
    }

  }

  // device
  // get timeline of specific user (twitter name)
  getUserTimeline_native(user): Promise<any> {

    if (this.auth_token) {
      this.nativeHttp.setHeader('*', 'Authorization', 'Bearer ' + this.auth_token);
      this.nativeHttp.setHeader('*', 'Content-Type', 'application/json');
      return this.nativeHttp.get(this.urlLink_timeline + user, '', {}).then( (reslt: any) => {
        return reslt.data;
      });
     } else {

        const dat: any = this.getToken_native().then( (tok: any) => {
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
