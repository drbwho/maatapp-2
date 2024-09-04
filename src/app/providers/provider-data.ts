import { ConfigData } from './config-data';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, ɵDEFAULT_LOCALE_ID } from '@angular/core';
import { Network } from '@capacitor/network';
import {v4 as uuidv4} from 'uuid';

import { Router } from '@angular/router';
import { UserData } from './user-data';
import { Events } from './events';
import { formatDate } from '@angular/common';
import { OperationTools } from './operation-tools';

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
  amount: any,
  inputdate: any
}

interface Meeting {
  id: any,
  idgroup: any,
  place: any,
  startedat: any,
  endedat: any,
  iduser: any,
  has_transactions: any,
  haspending: any,
  pending: any
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
    public loadingcontroller: LoadingController,
    private operationTools: OperationTools
  ) {}


  // Get data from API/STORAGE
  async fetch_data(type, typeid = '', force=false, showLoading = false){
    if(this[type] && !force){
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
            this.storage.set(file, this[type]);
            if(loading){loading.dismiss();}
            resolve(this[type]);
          },
          error: async (error) => {
            if(loading){loading.dismiss();}
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
          resolve({'status': 'success'});
        })
      })
    });
  }

  // Save locally new Operation
  async newOperation(meetingid, account, group, parameterid, parametername, amount){
    var trn: Transaction = {
      meetingid: meetingid,
      accountid: account.id,
      parameterid: parameterid,
      parametername: parametername,
      amount: amount,
      inputdate: formatDate(new Date(), 'Y-MM-dd H:mm:ss', ɵDEFAULT_LOCALE_ID)
    };

    return new Promise(async (resolve)=>{
      //Check operation against account totals
      let check: any = await this.operationTools.check_operation(account, group, trn);
      if(check.status != 'success'){
        resolve({'status': 'error', 'message': check.message});
        return;
      }
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

  clearPendingOperations(meeting: any){
    return new Promise(async (resolve)=>{
      let transactions = await this.storage.get(this.config.TRANSACTIONS_FILE);
      transactions = transactions.filter(s => s.meetingid != meeting.id);
      //find index
      /*let index = transactions.findIndex(s => s.meetingid == meeting.id);
      transactions.splice(index, 1);//remove element from array*/
      this.storage.set(this.config.TRANSACTIONS_FILE, transactions).then(()=>{
        this.events.publish('upload:updated');
        resolve(true);
      });
    })
  }

  /*
  * Get History of transactions
  *
  */
  async getHistory(object: any, type=''){
    let status = await Network.getStatus();
    if(!status.connected){
      return new Promise(async (resolve)=>{
        const toast = await this.toast.create({
          message: 'Network error! Cannot get history data...',
          cssClass: 'toast-alert',
          duration: 3000
        });
        toast.present();
        resolve([]);
      })
    }

    let loading = await this.loadingcontroller.create({showBackdrop: false});
    loading.present();

    let apiurl = this.config.GET_API_URL('operations', object.id);

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
            message: 'Network error! Cannot get history data...',
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


  /*
  * Init Syncing
  *
  */
  async uloadOperations(meeting){
    // First sync new meeting
    if(meeting.pending){
      let newmeet: any = await this.syncMeeting(meeting);
      if(newmeet.status != "success"){
        return new Promise((resolve)=>{
          resolve(newmeet);
        })
      }else{
        // clear meeting from local storage
        this.storage.get(this.config.NEWMEETINS_FILE).then((res)=>{
          let newmeetings = res;
          // find index
          let index = newmeetings.findIndex(s => s.id == meeting.id);
          newmeetings.splice(index, 1);//remove element from array
          this.storage.set(this.config.NEWMEETINS_FILE, newmeetings);
        })
      }
    }

    // Start sync transactions
    var transactions = await this.storage.get(this.config.TRANSACTIONS_FILE);
    if(transactions == null || !transactions.length){
      return new Promise((resolve)=>{
        resolve({'status': 'success'});
      })
    }
    transactions = transactions.filter(s=>s.meetingid == meeting.id);
    return new Promise(async (resolve)=>{
      var res: any = {status: 'success', message: ''};
      for(let tr of transactions){
        res = await this.syncOperation(tr.meetingid, tr.accountid, tr.parameterid, tr.amount, tr.inputdate);
        //if error stop uploading and return
        if(res.status.toLowerCase() == 'error'){
          // return name of account
          let accounts = await this.storage.get(this.config.GET_FILE('accounts'));
          let account = accounts.find(s => s.id == tr.accountid);
          res.name = account.owner;
          resolve(res);
          break;
        }
        //success
        this.delOperation(tr);
      }
      //Close meeting after succesfully uploading transactions
      if(meeting.endedat && res.status.toLowerCase() != 'error'){
        meeting.pending = false;
        await this.closeMeeting(meeting);
      }
      resolve(res);
    })
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
          resolve({status: 'error', message: 'Sync error'});
        }
      });
    });
  }


  /*
  * Sync operations to Server
  *
  */
  async syncOperation(meetingid, accountid, parameterid, amount, inputdate){
    const loading = await this.loadingcontroller.create({showBackdrop: false});
    loading.present();

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
            inputdate: inputdate,
            type: '',
            usetimezone: 0
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


}
