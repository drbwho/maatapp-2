import { ConfigData } from './config-data';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, ɵDEFAULT_LOCALE_ID } from '@angular/core';
import { Network } from '@capacitor/network';
import { v4 as uuidv4} from 'uuid';

import { Router } from '@angular/router';
import { UserData } from './user-data';
import { Events } from './events';
import { formatDate } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

export interface Current {
  country?: any;
  group?: any;
  meeting?: any;
}

export interface Meeting {
  id: any,
  idgroup: any,
  place?: any,
  startedat: any,
  endedat?: any,
  iduser: any,
  has_transactions?: any,
  haspending?: any,
  pending?: any
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
  networkStatus = false;

  constructor(
    public http: HttpClient,
    public user: UserData,
    public storage: Storage,
    public alertController: AlertController,
    public router: Router,
    public events: Events,
    public config: ConfigData,
    public toast: ToastController,
    public loadingcontroller: LoadingController,
    private translate: TranslateService
  ) {}


  // Clear loaded data
  clear(){
    this.accounts = [];
    this.countries = [];
    this.meetings = [];
    this.data = null;
  }

  // Get data from API/STORAGE
  async fetch_data(type, typeid = '', force=false, showLoading = false){
    if(this[type] && (this[type]).length && !force){
      return new Promise((resolve)=>{
        resolve(this[type]);
      });
    }

    let loading = null;
    if(showLoading){
      loading = await this.loadingcontroller.create({showBackdrop: false});
      loading.present();
    }

    let status = await Network.getStatus();
    //status.connected = false;
    if(!status.connected){
      // fetch from storage
      return this.storage.get(this.config.GET_FILE(type)).then((res)=>{
        if(loading) {loading.dismiss();}
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
            if(type == 'accounts'){
              //sort accounts
              this[type].sort((a,b) => a.num - b.num);
            }
            this.storage.set(file, this[type]);
            if(loading){loading.dismiss();}
            resolve(this[type]);
          },
          error: async (error) => {
            if(loading){loading.dismiss();}
            console.log("Network Error!");
            this.translate.get(['network_error_no_updates']).subscribe(async (keys: any)=>{
              const toast = await this.toast.create({
                message: keys['network_error_no_updates'],
                cssClass: 'toast-alert',
                duration: 3000
              });
              toast.present();
            });
            // else load from storage/local file
            this.storage.get(this.config.GET_FILE(type)).then((res)=>{
              if(res){
                console.log('type: ' + type + ' fetching from storage...');
                if(type == 'accounts' || type == 'meetings'){
                  resolve(res.filter(s => s.idgroup == typeid));
                }else{
                  resolve(res);
                }
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

  // Save locally new Meeting
  async newMeeting(groupid: any, place: any, startdate: any){
    var meetingid = uuidv4(); // create new uuid
    let user = await this.user.getUser();
    var meet: Meeting = {
      id: meetingid,
      idgroup: groupid,
      place: place,
      startedat: startdate,
      endedat: null,
      iduser: user.id,
      has_transactions: 0,
      haspending: 0,
      pending: true
    };

    return new Promise((resolve)=>{
      this.storage.get(this.config.NEWMEETINS_FILE).then((res)=>{
        var meets: Meeting[] = [];
        if(res){
         meets = res;
        }
        meets.push(meet);
        this.storage.set(this.config.NEWMEETINS_FILE, meets).then((res)=>{
          this.events.publish('upload:updated');
          resolve({'status': 'success', 'meeting': meet});
        })
      })
    });
  }



  /*
  * Sync meeting to Server
  *
  */
  async syncMeeting(meeting){
    let apiurl = this.config.GET_API_URL('meetings', meeting.idgroup);

    const user = await this.user.getUser();
    const headers =  new HttpHeaders({
      'Authorization': 'Bearer ' + user.token,
      'Accept': 'application/json'
    });

    return new Promise((resolve)=>{
      this.http
      .put(apiurl,
        {
          newid: meeting.id,
          idgroup: meeting.idgroup,
          startedat: meeting.startedat,
          endedat: null,
          place: meeting.place,
          iduser: meeting.iduser,
          cancelled: meeting.cancelled
        },
        {headers})
      .subscribe({
        next: (data: any) => {
          resolve({status: 'success', message: ''});
        },
        error: async (error) => {
          resolve({status: 'error', message: error.error});
        }
      });
    });
  }

  async closeUserAccount(account: any){
    let apiurl = this.config.GET_API_URL('groups') + '/closeuser';

    const user = await this.user.getUser();
    const headers =  new HttpHeaders({
      'Authorization': 'Bearer ' + user.token,
      'Accept': 'application/json'
    });

    return new Promise((resolve)=>{
      this.http
      .post(apiurl,
        {
          accountid: account.id
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

  async closeMeeting(meeting){
    // its a new meeting
    if(meeting.pending){
      let newmeetings = await this.storage.get(this.config.NEWMEETINS_FILE);
      let meet = newmeetings.find(s => s.id == meeting.id);
      meet.endedat = formatDate(new Date(), 'Y-MM-dd', ɵDEFAULT_LOCALE_ID);
      return new Promise((resolve)=>{
        this.storage.set(this.config.NEWMEETINS_FILE, newmeetings).then(()=>{
          resolve({status: 'success', message:''});
        })
      })
    }

    let status = await Network.getStatus();
    if(!status.connected){
      return new Promise((resolve)=>{
        resolve({status: 'error', message: 'There is no network connection to perform this action!'});
      })
    }

    let apiurl = this.config.GET_API_URL('meetings', '0');

    const user = await this.user.getUser();
    const headers =  new HttpHeaders({
      'Authorization': 'Bearer ' + user.token,
      'Accept': 'application/json'
    });

    return new Promise((resolve)=>{
      this.http
      .post(apiurl,
        {
          id: meeting.id,
          close: true
        },
        {headers})
      .subscribe({
        next: (data: any) => {
          console.log(data);
          resolve(data);
        },
        error: async (error) => {
          resolve({status: 'error', message: 'Sync error'});
        }
      });
   });
  }

  async cancelMeeting(meeting){
    // its a new meeting
    if(meeting.pending){
      let newmeetings = await this.storage.get(this.config.NEWMEETINS_FILE);
      let meet = newmeetings.find(s => s.id == meeting.id);
      meet.cancelled = 1;
      meet.endedat = formatDate(new Date(), 'Y-MM-dd', ɵDEFAULT_LOCALE_ID);
      return new Promise((resolve)=>{
        this.storage.set(this.config.NEWMEETINS_FILE, newmeetings).then(()=>{
          resolve(true);
        })
      })
    }
    let apiurl = this.config.GET_API_URL('meetings', '0');

    const user = await this.user.getUser();
    const headers =  new HttpHeaders({
      'Authorization': 'Bearer ' + user.token,
      'Accept': 'application/json'
    });

    return new Promise((resolve)=>{
      this.http
      .post(apiurl,
        {
          id: meeting.id,
          cancel: true
        },
        {headers})
      .subscribe({
        next: (data: any) => {
          console.log(data);
          resolve(data);
        },
        error: async (error) => {
          resolve({status: 'error', message: 'Sync error'});
        }
      });
   });
  }

  /*
  * Set / Get Current Country/Group
  *
  * */
  getCurrent(): Promise<Current> {
    return this.storage.get(this.config.CURRENT_FILE).then((value: any) => {
      if(value){
        this.current = value;
        return value;
      }else{
        return {};
      }
    });
  }

  setCurrent(current: Current): Promise<boolean> {console.log(current)
    return this.storage.set(this.config.CURRENT_FILE, current).then((value) => {
      this.current = current;
      return true;
    });
  }

  /*
  * Update pending meeting in storage
  *
  */
  updatePendingMeeting(meeting){
    // its a new meeting?
    if(meeting.pending){
      return new Promise(async (resolve)=>{
        let newmeetings = await this.storage.get(this.config.NEWMEETINS_FILE);
        const index = newmeetings.findIndex(m => m.id === meeting.id);
        //update the hole object
        if (index !== -1) {
          newmeetings[index] = meeting;
          this.storage.set(this.config.NEWMEETINS_FILE, newmeetings).then(()=>{
            resolve(true);
          })
        }
      })
    }
  }


  /*
  * Post new support ticket
  *
  */
  async newTicket(body: any){
    const loading = await this.loadingcontroller.create({showBackdrop: false});
    loading.present();

    let apiurl = this.config.GET_API_URL('tickets');

    const user = await this.user.getUser();
    const headers =  new HttpHeaders({
      'Authorization': 'Bearer ' + user.token,
      'Accept': 'application/json'
    });

    return new Promise((resolve)=>{
      this.http
        .post(apiurl,
          {
            body: body,
          },
          {headers})
        .subscribe({
          next: (data: any) => {
            console.log(data);
            loading.dismiss().then(()=>{
              resolve(data);
            });
          },
          error: async (error) => {
            loading.dismiss().then(()=>{
              resolve({status: 'error', message: 'Network error'});
            });
          }
        });
    });
  }

  /*
  * Get Submitted Tickets
  *
  */
  async getTickets(){
    let status = await Network.getStatus();
    if(!status.connected){
      return new Promise(async (resolve)=>{
        const toast = await this.toast.create({
          message: 'Network error! Cannot get tickets...',
          cssClass: 'toast-alert',
          duration: 3000
        });
        toast.present();
        resolve([]);
      })
    }

    let loading = await this.loadingcontroller.create({showBackdrop: false});
    loading.present();

    let apiurl = this.config.GET_API_URL('tickets');

    const user = await this.user.getUser();
    const headers =  new HttpHeaders({
      'Authorization': 'Bearer ' + user.token,
      'Accept': 'application/json'
    });

    return new Promise((resolve)=>{
      this.http
      .get(apiurl,{headers})
      .subscribe({
        next: (data: any) => {
          loading.dismiss();
          resolve(data);
        },
        error: async (error) => {
          const toast = await this.toast.create({
            message: 'Network error! Cannot get tickets...',
            cssClass: 'toast-alert',
            duration: 3000
          });
          loading.dismiss().then(()=>{
            toast.present();
          });
          resolve([]);
        }
      });
    });
  }


}
