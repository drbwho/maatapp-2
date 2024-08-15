import { ConfigData } from './config-data';
import { AlertController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Network } from '@capacitor/network';

import { Router } from '@angular/router';
import { UserData } from './user-data';
import { Events } from './events';
import { stat } from 'fs';

interface Current {
  country?: any;
  group?: any;
  meeting?: any;
}

interface Transaction {
  meetingid: any,
  accountid: any,
  parameterid: any,
  parametername: any,
  amount: any
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
  ) {}


  // Get data from API/STORAGE
  async fetch_data(type, typeid = '', force=false){
    if(this[type] && !force){
      return new Promise((resolve)=>{
        resolve(this[type]);
      });
    }
    let status = await Network.getStatus();
    status.connected = false;
    if(!status.connected){
      // fetch from storage
      return this.storage.get(this.config.GET_FILE(type)).then((res)=>{
        if(res){
          return (res);
        }else{
          return [];
        }
      });
    }else{
      // fetch from api
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
            this.storage.set(file, this[type]);
            resolve(this[type]);
          },
          error: async (error) => {
            console.log("Network Error!");
            const toast = await this.toast.create({
              message: 'Network error! Cannot check for updates...',
              cssClass: 'toast-alert',
              duration: 3000
            });
            toast.present();
            // else load from storage/local file
            this.storage.get(this.config.GET_FILE(type)).then((res)=>{
              if(res){
                console.log('type: ' + type + ' fetching from storage...');
                resolve(res);
              }else{
                resolve(fetch("../../assets/data/meetings.json").then(res=>res.json()).then(json=>{
                  this[type] = json.meetings;
                    this.storage.set(file,this[type]);
                    return this[type];
                  })
                );
              }
            });
          }
        });
     });
    }
  }

  // Save locally new Meeting Operation
  async newOperation(meetingid, accountid, parameterid, parametername, amount){
    var trn: Transaction = {
      meetingid: meetingid,
      accountid: accountid,
      parameterid: parameterid,
      parametername: parametername,
      amount: amount
    };

    return new Promise((resolve)=>{
      this.storage.get(this.config.TRANSACTIONS_FILE).then((res)=>{
        var trns: Transaction[] = [];
        if(res){
         trns = res;
        }
        trns.push(trn);
        this.storage.set(this.config.TRANSACTIONS_FILE, trns).then((res)=>{
          this.events.publish('upload:updated');
          resolve({'status': 'success'});
        })
      })
    });
  }

  delOperation(tr: any){
    return new Promise(async (resolve)=>{
      let transactions = await this.storage.get(this.config.TRANSACTIONS_FILE);
      //find index
      let index = transactions.findIndex(s => s.accountid == tr.accountid && s.meetingid == tr.meetingid && s.parameterid == tr.parameterid && s.amount == tr.amount); 
      transactions.splice(index, 1);//remove element from array
      this.storage.set(this.config.TRANSACTIONS_FILE, transactions).then(()=>{
        this.events.publish('upload:updated');
        resolve(true);  
      });
    })
  }

  // Sync operations to Server
  async syncOperation(meetingid, accountid, parameterid, amount){
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
