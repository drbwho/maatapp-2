import { ConfigData } from './config-data';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Events, MenuController, Platform, ToastController, AlertController, LoadingController } from '@ionic/angular';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsData {
  _news: any;

  constructor(
    public storage: Storage,
    public alertController: AlertController,
    public events: Events,
    public config: ConfigData
  ) { }


  load(): any {
    if (this._news) {
      return of(this._news);
    } else {
        // always load data from local stored file
        return from(this.storage
            .get(this.config.NEWS_FILE));
    }
  }

  loadNews () {
    this.storage.get(this.config.NEWS_FILE).then( (res) => {
      if (res === null) {
        this._news = [];
      } else {
        this._news = res;
      }
    });
  }


  check_news(httpclient) {
    const headers = new HttpHeaders();
    headers.append('Cache-control', 'no-cache');
    headers.append('Cache-control', 'no-store');
    headers.append('Expires', '0');
    headers.append('Pragma', 'no-cache');

    let maxlocalid = 0;
    if (this._news) {
      maxlocalid = Math.max.apply(Math, this._news.map( (o: any) => Number(o.id), 0));
    }
        httpclient
           .get(this.config.API_NEWS_URL, {headers})
           .subscribe( async (data: any) => {
              if (data.length > 0) {
                const maxremoteid = Math.max.apply(Math, data.map( (o: any) => Number(o.id), 0));
                if (maxlocalid < maxremoteid) {
                    this._news = data;
                    this.storage.set(this.config.NEWS_FILE, data);
                    this.storage.set(this.config.HAS_UNREAD_NEWS, true);
                    this.events.publish('user:unreadnews', true);
                    const alert = await this.alertController.create({
                      header: 'New Announcement!',
                      message: 'A new Announcement has been published. Please check it in the menu on the left',
                      buttons: [
                        {
                          text: 'Ok',
                          handler: (blah) => {
                            console.log('Confirm Ok:');
                          }
                        }
                      ]
                    });
                    await alert.present();
                }
              }
           });
  }


}
