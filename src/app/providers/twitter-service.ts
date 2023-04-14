import { from, Observable } from 'rxjs';
import { Platform } from '@ionic/angular';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { CapacitorHttp } from '@capacitor/core';
import { Buffer } from 'buffer';

@Injectable({
  providedIn: 'root'
})
export class TwitterService {
  // in browser api calls use our bkk proxy
  urlLink_timeline = 'https://api.twitter.com/1.1/statuses/user_timeline.json?count=20&screen_name=';
  urlLink_token = 'https://api.twitter.com/oauth2/token';
  urlLink_timeline_proxy = 'https://bkk-apps.com/twitter/1.1/statuses/user_timeline.json?count=20&screen_name=';
  urlLink_token_proxy = 'https://bkk-apps.com/twitter/oauth2/token';
  api_key = 'Fh7Udfd1WyTpCL3FLQP6eskt0';
  api_secret = 'i8DcFJMMpkyspanHO5M4WNazXXImNupPKmZYdD7NgyyhZ4uwV6';

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

 // device
 async getToken_native() {
    //const b64 = btoa(this.oauth_consumer_key + ':' + this.consumerSecret);
    //const body = 'grant_type=client_credentials';

    //this.nativeHttp.setDataSerializer( 'utf8' );
    //this.nativeHttp.setHeader('*', 'Accept', 'application/json');
    //this.nativeHttp.setHeader('*', 'Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
    //this.nativeHttp.setHeader('*', 'Authorization', 'Basic ' + b64);
    //const res = await this.nativeHttp.post(this.urlLink_token, body, {headers: headers});

    const b64 = Buffer.from(this.api_key + ':' + this.api_secret).toString('base64');

    const res = await CapacitorHttp.post({ url: this.urlLink_token, 
      headers:
       {'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Authorization': 'Basic ' + b64},
      params:
       {'grant_type':'client_credentials'}});
    console.log(res);
    const data = JSON.parse(res.data);
    console.log('Token' + data.access_token);
    return data.access_token;
 }

  // browser
  // get timeline of specific user (twitter name)
  getUserTimeline_web(user): Promise<any> {
    const b64 = Buffer.from(this.api_key + ':' + this.api_secret).toString('base64');
    const body = 'grant_type=client_credentials';

    if (this.auth_token) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.auth_token
      });
      return (this.http.get(this.urlLink_timeline_proxy + user, {headers: headers})).toPromise().then ( (reslt: any) => {
        return JSON.stringify(reslt);
      });
    } else {
      let headers = new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Authorization': 'Basic ' + b64
      });
      return (this.http.post(this.urlLink_token_proxy, body, {headers: headers})).toPromise().then ( (res: any) => {
        console.log('Token' + res.access_token);
        this.auth_token = res.access_token;
         headers = new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.auth_token
        });
        return (this.http.get(this.urlLink_timeline_proxy + user, {headers: headers})).toPromise().then ( (reslt: any) => {
          return JSON.stringify(reslt);
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
