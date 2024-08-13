import { ConfigData } from './config-data';
import { AlertController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { AppComponent } from '../app.component';

import { Router } from '@angular/router';
import { UserData } from './user-data';
import { Events } from './events';

interface Current {
  country?: any;
  group?: any;
  meeting?: any;
}


@Injectable({
  providedIn: 'root'
})

export class DataProvider {
  data: any;
  countries: [];
  meetings: [];
  accounts: [];
  current: Current = {};

  constructor(
    public http: HttpClient,
    public user: UserData,
    public storage: Storage,
    public alertController: AlertController,
    public router: Router,
    public events: Events,
    public config: ConfigData,
    public toast: ToastController,
    public appComponent: AppComponent
  ) {}


  // Get info from API
  async fetch_from_api(type, typeid = '', force=false){
    if(this[type] && !force){
      return new Promise((resolve)=>{
        resolve(this[type]);
      });
    }else if(!this.appComponent.networkStatus){
      this.storage.get(this.config.STORAGE_FILE(type)).then

    }else{
      let apiurl = this.config.GET_API_URL(type, typeid);
      let file = this.config.GET_FILE(type);

      const user = await this.user.getUser();
      const headers =  new HttpHeaders({
        'Authorization': 'Bearer ' + user.token,
        'Accept': 'application/json'
      });

      return new Promise((resolve)=>{
        this.http
        .get(apiurl, {headers})
        .subscribe({
          next: (data: any) => {
            this[type] = data[type];
            this.storage.set(file, this.countries);
            resolve(this[type]);
          },
          error: async (error) => {
            console.log("Network Error!");
            const toast = await this.toast.create({
              message: 'Network error! Cannot check for updates...',
              cssClass: 'toast-alert',
              duration: 5000
            });
            toast.present();
            // else load from local file
            resolve(fetch("../../assets/data/meetings.json").then(res=>res.json()).then(json=>{
              this[type] = json.meetings;
                this.storage.set(file,this[type]);
                return this[type];
              })
            );
          }
        });
     });
    }
  }

  // Add new Meeting Operation
  async newOperation(meetingid, accountid, parameterid, amount){
      let apiurl = this.config.GET_API_URL('operations', meetingid);

      const user = await this.user.getUser();
      const headers =  new HttpHeaders({
        'Authorization': 'Bearer ' + user.token,
        'Accept': 'application/json'
      });

      return new Promise((resolve)=>{
        this.http
        .post(apiurl,
          {
            parameter: parameterid,
            accountid: accountid,
            amount: amount,
            type: ''
          },
          {headers})
        .subscribe({
          next: (data: any) => {
            console.log(data);
            resolve(data);
          },
          error: async (error) => {
            resolve({status: 'error', message: 'Network error'});
          }
        });
     });
  }

}
