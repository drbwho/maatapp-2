import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ConferenceData } from './../../providers/conference-data';
import * as Oauth from '../../../assets/js/oauth.js';
import { HTTP } from '@ionic-native/http/ngx';
import { JSDocCommentStmt } from '@angular/compiler';

@Component({
  selector: 'home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})


export class HomePage implements OnInit {
  conftitle: string;
  oauth: any;

  constructor(public dataProvider: ConferenceData, public http: HTTP) { }

  ngOnInit() {
    this.dataProvider.load().subscribe((data: any) => {
      if (data && data.eventdates) {
          this.conftitle = data.info[0].title;
        }
      });
  }

  ionViewWillEnter() {
    interface IRequestOptions {
      body?: any;
      headers?: HttpHeaders | { [header: string]: string | Array<string> };
      observe?: any;
      params?: HttpParams | { [param: string]: string | Array<string> };
      reportProgress?: boolean;
      withCredentials?: boolean;
    }
    this.oauth = Oauth;

    const urlLink_timeline = 'https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=EVAlondonconf&count=5';
    const urlLink_token = 'https://api.twitter.com/oauth2/token';


    const oauth_consumer_key = 'TyIOYJ7He8PbhP5iaOaSoNgRl';
    const consumerSecret = 'qFJ265oOVpU3PQrz6ogpM5iMVws0QCQ89ePC1bR6xqheklrLCC';
/*
    const oauth_token = '1168161377346867200-IsbPqVbtdcouSNWGTriHZ9XlSceSI0';
    const tokenSecret = 'YNgiiXMjkPhDH777A137tvoCkEp4glwxRsnjFBZ1bwss9';

    const twitterStatus = 'Sample tweet';
    const nonce = this.oauth.nonce(32);
    const ts = Math.floor(new Date().getTime() / 1000);
    const timestamp = ts.toString();

    const accessor = {
        'consumerSecret': consumerSecret,
        'tokenSecret': tokenSecret
    };

    const params = {
        'status': twitterStatus,
        'oauth_consumer_key': oauth_consumer_key,
        'oauth_nonce': nonce,
        'oauth_signature_method': 'HMAC-SHA1',
        'oauth_timestamp': timestamp,
        'oauth_token': oauth_token,
        'oauth_version': '1.0'
    };
    const message = {
        'method': 'POST',
        'action': urlLink_timeline,
        'parameters': params
    };


    // lets create signature
    this.oauth.SignatureMethod.sign(message, accessor);
    const normPar = this.oauth.SignatureMethod.normalizeParameters(message.parameters);
    const baseString = this.oauth.SignatureMethod.getBaseString(message);
    const sig = this.oauth.getParameter(message.parameters, 'oauth_signature') + '=';
    const encodedSig = this.oauth.percentEncode(sig); // finally you got oauth signature
*/
    const b64 = btoa(oauth_consumer_key + ':' + consumerSecret);
    const body = 'grant_type=client_credentials';

    this.http.setDataSerializer( 'utf8' );
    this.http.setHeader('*', 'Accept', 'application/json');
    this.http.setHeader('*', 'Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
    this.http.setHeader('*', 'Authorization', 'Basic ' + b64);

    this.http.post(urlLink_token, body, {}).then( (res: any) => {
      const data = JSON.parse(res.data);
      const auth_token = data.access_token;
      console.log('Token' + data.access_token);

      this.http.setHeader('*', 'Authorization', 'Bearer ' + auth_token);
      this.http.setHeader('*', 'Content-Type', 'application/json');
      this.http.get(urlLink_timeline, '', {}).then( (reslt: any) => {
        const tweets = JSON.parse(reslt.data);
        console.log('Data' + JSON.stringify(tweets));
       });
     });
  }

}
