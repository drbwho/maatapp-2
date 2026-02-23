import { Injectable, ɵDEFAULT_LOCALE_ID } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from './config-data';
import { TranslateService } from '@ngx-translate/core';
import { formatDate } from '@angular/common';
import { Events } from './events';
import { DataProvider, Current, Meeting } from './provider-data';
import { Network } from '@capacitor/network';
import { ToastController } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserData } from './user-data';
import { MeetingTotals, Transaction } from '../interfaces/data-interfaces';

@Injectable({
  providedIn: 'root'
})
export class OperationTools {
  public credit_operations = ['ECP', 'RCB', 'REM', 'SFREM', 'FIN', 'ENF', 'PCO', 'AST', 'AID', 'SFND'];
  public debit_operations = ['RCP', 'EMP', 'SFEMP', 'AIN', 'CFS'];
  public contrib_operations = ['RCB','AID','AST'];
  public map_default_to_settings = {
    'RCB': 'regcontribution',
    'AID': 'regsfcontribution',
    'AST': 'regfacilpayment',
    'ENF': 'entryfee'
  }

  constructor(
    private http: HttpClient,
    private storage: Storage,
    private config: ConfigData,
    private translate: TranslateService,
    private events: Events,
    private dataProvider: DataProvider,
    private toast: ToastController,
    private loadingcontroller: LoadingController,
    private user: UserData
  ) { }


   // Save locally new Operation
  newOperation(meetingid, account, group, parameterid, parametername, amount, categories="", notes=""): Promise<any>{
    var trn: Transaction = {
      meetingid: meetingid,
      accountid: account.id,
      parameterid: parameterid,
      parametername: parametername,
      amount: amount,
      categories: categories,
      notes: notes,
      inputdate: formatDate(new Date(), 'Y-MM-dd H:mm:ss', ɵDEFAULT_LOCALE_ID)
    };

    return new Promise(async (resolve)=>{
      //Check operation against account totals
      let check: any = await this.check_operation(account, group, trn);
      if(check.status != 'success'){
        resolve({'status': 'error', 'message': check.message});
        return;
      }
      await this.storage.get(this.config.TRANSACTIONS_FILE).then(async (res)=>{
        var trns: Transaction[] = [];
        if(res){
         trns = res;
        }
        //Insert or update transaction
        let index = trns.findIndex((s)=> s.meetingid == meetingid && s.accountid == account.id && s.parameterid == parameterid);
        if(index >= 0){
          trns[index] = trn;
        }else{
          trns.push(trn);
        }
        await this.storage.set(this.config.TRANSACTIONS_FILE, trns).then((res)=>{
          this.events.publish('upload:updated');
          resolve({'status': 'success'});
          return;
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

  delOperationByParameter(accountId: any, meetingId: any, parameterId: any){
    return new Promise(async (resolve)=>{
      let transactions = await this.storage.get(this.config.TRANSACTIONS_FILE);
      transactions = transactions.filter(s => !(s.accountid == accountId && s.meetingid == meetingId && s.parameterid == parameterId));
      await this.storage.set(this.config.TRANSACTIONS_FILE, transactions).then(()=>{
        this.events.publish('upload:updated');
        resolve(true);
      });
    })
  }

  /*
  * Remove account's pending operations
  *
  */
  delAccountOperations(account: any, meeting: any){
    return new Promise(async (resolve)=>{
      let transactions = await this.storage.get(this.config.TRANSACTIONS_FILE);    
      transactions = transactions.filter(tr => !(tr.accountid === account.id && tr.meetingid === meeting.id));
      await this.storage.set(this.config.TRANSACTIONS_FILE, transactions).then(()=>{
        this.events.publish('upload:updated');
        resolve(true);
      });
    })
  }

  async refreshMeetingHistory(meetingId: any){
    let history: any = await this.getHistory(meetingId);
    history = history.operations;
    if(!history || !history.length){
      return;
    }
    let old_history = await this.storage.get(this.config.HISTORY_TRANSACTIONS_FILE);
    if(old_history && old_history.length){
      old_history = old_history.filter(s => s.meetingid == meetingId);
      history = [...old_history, ...history];
    }
    this.storage.set(this.config.HISTORY_TRANSACTIONS_FILE, history);
  }

  clearPendingOperations(meeting: any, clearMeeting = false){
    if(clearMeeting){
      return new Promise(async (resolve)=>{
        let newmeetings = await this.storage.get(this.config.NEWMEETINS_FILE);
        newmeetings = newmeetings.filter(s => s.id != meeting.id);
        this.storage.set(this.config.NEWMEETINS_FILE, newmeetings).then(()=>{
          this.events.publish('upload:updated');
          resolve(true);
        });
      })
    }

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
  async getHistory(objectId: any, type=''){
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

    let apiurl = this.config.GET_API_URL('operations', objectId);

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
  async uploadOperations(meeting){
    // First sync new meeting
    if(meeting.pending){
      let newmeet: any = await this.dataProvider.syncMeeting(meeting);
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
      //Clear previous uploading errors
      var upload_errors = await this.storage.get(this.config.UPLOAD_ERRORS_FILE);
      if(upload_errors) {
        upload_errors = upload_errors.filter((s)=>s.meetingid != meeting.id);
      }else{
        upload_errors = [];
      }
      var found_errors = false;
      for(let tr of transactions){
        res = await this.syncOperation(tr);
        //if error stop uploading and return
        if(res.status.toLowerCase() == 'error'){
          // return name of account
          let accounts = await this.storage.get(this.config.GET_FILE('accounts'));
          let account = accounts.find(s => s.id == tr.accountid);
          res.name = account.owner;
          upload_errors.push({meetingid: tr.meetingid, accountid: tr.accountid, parameterid: tr.parameterid, message: res.message});
          found_errors = true;
          //resolve(res);
          //break;
        }else{
          //success
          //delete pending operation
          this.delOperation(tr);
        }
      }
      this.storage.set(this.config.UPLOAD_ERRORS_FILE, upload_errors);
      if(found_errors){
        this.translate.get('uploading_with_errors').subscribe((key)=>{
          resolve({'status': 'error', 'message': key});
        });
      }
      //Close meeting after succesfully uploading transactions
      if(meeting.endedat){
        meeting.pending = false;
        await this.dataProvider.closeMeeting(meeting);
      }
      resolve(res);
    })
  }


  /*
  * Sync operations to Server
  *
  */
  async syncOperation(tr){
    const loading = await this.loadingcontroller.create({showBackdrop: false});
    loading.present();

    let apiurl = this.config.GET_API_URL('operations', tr.meetingid);

    const user = await this.user.getUser();
    const headers =  new HttpHeaders({
      'Authorization': 'Bearer ' + user.token,
      'Accept': 'application/json'
    });

    return new Promise((resolve)=>{
      this.http
        .post(apiurl,
          {
            parameter: tr.parameterid,
            accountid: tr.accountid,
            amount: tr.amount,
            inputdate: tr.inputdate,
            categories: tr.categories,
            notes: tr.notes,
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


  /*
  * Estimate account/meeting totals from all transactions
  *
  */
  estimate_meeting_totals (account: any, meetingId: any): Promise<any> {
    return new Promise(async (resolve)=>{
      let totals: MeetingTotals = {
        credit: 0.00,
        balance: 0.00,
        cash: 0.00,
        loans: 0.00,
        transactions: new Map<string, number>()
      };
      let currenttr = 0.00;
      let trans = [];
      //await this.refreshMeetingHistory(meetingId); history is already refreshed! by total_ECP
      this.storage.get(this.config.TRANSACTIONS_FILE).then(async (data)=>{
        if(data){
          trans = data.filter(s => s.meetingid == meetingId);
          if(account){
            trans = trans.filter(s => s.idaccount == account.id);
          }
        }
        let params = await this.storage.get(this.config.GET_FILE('params'));
        totals.credit = account?.creditdisponible ? parseFloat(account?.creditdisponible) : 0.00;
        totals.balance = account?.balance ? parseFloat(account?.balance) : 0.00;
        totals.cash = 0.00;
        totals.loans = 0.00;
        trans.forEach((tr)=>{
          let pcode = (params.find((s) => s.id == tr.parameterid)).code;
          if(this.credit_operations.includes(pcode)){
            if(pcode != 'AST'){
              totals.credit += parseFloat(tr.amount);
              totals.balance += parseFloat(tr.amount);
            }
            totals.cash += parseFloat(tr.amount);
          }else if(this.debit_operations.includes(pcode)){
            totals.credit -= parseFloat(tr.amount);
            if(pcode != 'CFS'){
              totals.balance -= parseFloat(tr.amount);
              totals.cash -= parseFloat(tr.amount);
            }
          }
          if(pcode == 'EMP'){
            totals.loans += parseFloat(tr.amount);
          }
          // save transactions' sums
          currenttr = totals.transactions.get(pcode) || 0.00;
          totals.transactions.set(pcode, currenttr + parseFloat(tr.amount));
        });
        // iterate in already uploaded transactions
        let uploaded_transactions = await this.storage.get(this.config.HISTORY_TRANSACTIONS_FILE);
        if(uploaded_transactions && uploaded_transactions.length){
          uploaded_transactions = uploaded_transactions.filter(s => s.idmeeting == meetingId);
           if(account){
            uploaded_transactions = uploaded_transactions.filter(s => s.idaccount == account.id);
          }
          if(uploaded_transactions.length){
            uploaded_transactions.forEach((tr)=>{
              let pcode = (params.find((s) => s.id == tr.idparameter)).code;
              // calculate only cash from uploaded transactions
              if(this.credit_operations.includes(pcode)){
                totals.cash += parseFloat(tr.credit ? tr.credit : tr.debit);
              }else if(this.debit_operations.includes(pcode)){
                totals.cash -= parseFloat(tr.credit ? tr.credit : tr.debit);
              }
              if(pcode == 'EMP'){
                totals.loans += parseFloat(tr.debit);
              }
              // save transactions' sums
              currenttr = totals.transactions.get(pcode) || 0.00;
              totals.transactions.set(pcode, currenttr + parseFloat((tr.credit ? tr.credit : tr.debit)));
            });
          }
        }
        resolve(totals);
      })
    });
  }

  /*
  * Check operation amount against totals
  *
  */
  check_operation(account, group, transaction){
    return new Promise(async (resolve)=>{
      let params = await this.storage.get(this.config.GET_FILE('params'));
      let pcode = (params.find((s) => s.id == transaction.parameterid)).code;
      let group_account = await this.storage.get(this.config.GET_FILE('accounts'));
      if(account.type == 2){
        group_account = account;
      }else{
        group_account = group_account.find((s)=>s.idowner == group.id);
      }
      let group_totals = await this.estimate_meeting_totals(group_account, transaction.meetingid);
      switch(pcode){
        case 'EMP':
          if(transaction.amount > account.creditdisponible && group.settings.credit_borrow_multiplier >= 0){
            this.translate.get('loan_exceeds_credit_available').subscribe((key)=>{
              resolve({'status': 'error', 'message': key})
            });
          }
          if(transaction.amount > group_totals.credit){
            this.translate.get('loan_exceeds_group_credit_available').subscribe((key)=>{
              resolve({'status': 'error', 'message': key})
            });
          }
          if(group.settings.maxnumopenloans > 0 && (account.openloans >= group.settings.maxnumopenloans)){
            this.translate.get('max_num_loans_exceeded').subscribe((key)=>{
              resolve({'status': 'error', 'message': key})
            });
          }
          if(group.settings.maxnumopensfloans > 0 && (account.sfopenloans >= group.settings.maxnumopensfloans)){
            this.translate.get('max_num_sfloans_exceeded').subscribe((key)=>{
              resolve({'status': 'error', 'message': key})
            });
          }
          break;
        case 'RCP':
          if(account.restearembourser > 0){
            this.translate.get('withdrawl_not_permitted_open_loans').subscribe((key)=>{
              resolve({'status': 'error', 'message': key})
            });
            break;
          }
          if(transaction.amount > account.balance){
            this.translate.get('withdrawl_exceeds_balance').subscribe((key)=>{
              resolve({'status': 'error', 'message': key})
            });
          }
          break;
        case 'SFEMP':
          if(transaction.amount > group_account.creditdisponible ||
             transaction.amount > (group_account.sfcontribution - group_account.sfrestearembourser)){
            this.translate.get('loan_exceeds_group_totals').subscribe((key)=>{
              resolve({'status': 'error', 'message': key})
            });
          }
          if(transaction.amount > group_totals.credit){
            this.translate.get('loan_exceeds_group_credit_available').subscribe((key)=>{
              resolve({'status': 'error', 'message': key})
            });
          }
          break;
        case 'REM':
          if(transaction.amount > account.restearembourser){
            this.translate.get('reimbursement_exceeds_loan_debt').subscribe((key)=>{
              resolve({'status': 'error', 'message': key})
            });
          }
          break;
        case 'SFREM':
          if(transaction.amount > account.sfrestearembourser){
            this.translate.get('reimbursement_exceeds_sf_loan_debt').subscribe((key)=>{
              resolve({'status': 'error', 'message': key})
            });
          }
          break;
      }

      //Group transactions
      let groupops = ['AIN', 'CFS', 'RCPM', 'REMM', 'EMPM'];
      if(groupops.includes(pcode)){
        if(transaction.amount > group_totals.credit){
          this.translate.get('amount_exceeds_group_credit_available').subscribe((key)=>{
            resolve({'status': 'error', 'message': key})
          });
        }
      }

      resolve({'status':'success'});
    })
  }

  /*
  * Get number of ECP transactions
  *
  */
  get_num_of_ECP(meeting, countryId):Promise<number>{
    return new Promise((resolve) => {
      this.storage.get(this.config.GET_FILE('params')).then(async (data: any)=> {
        let param = null;
        if(data.length){
          param = (data.filter((a)=> a.code === 'ECP'))[0];
        }
        this.refreshMeetingHistory(meeting.id).then(()=>{
          let trans = [];
          this.storage.get(this.config.TRANSACTIONS_FILE).then(async (data)=>{
            if(data && data.length){
              trans = data.filter(s=>s.meetingid == meeting.id && s.parameterid == param.id && !s.is_cancelled);
            }
            // iterate in already uploaded transactions
            this.storage.get(this.config.HISTORY_TRANSACTIONS_FILE).then((data)=>{
              if(data && data.length){
                let uptrans = data.filter(s=>s.idmeeting == meeting.id && s.idparameter == param.id && s.is_cancelled == false);
                trans = [...trans, ...uptrans];
              }
              let num = new Set(trans?.map(d => d.idaccount)).size;
              resolve(num);
            });
          })
        })
      })
    })
  }

  get_contribution_totals(meetingId: string){
    let totals = [];
    let total = 0.0;
    return new Promise((resolve) => {
      this.storage.get(this.config.GET_FILE('params')).then(async (data: any)=> {
        let params = data
                    .filter(p => this.contrib_operations.includes(p.code))
                    .reduce((p, { id, code }) => {
                      p[id] = code;
                      return p;
                    }, {}); // create array of ids..
        Object.values(params).forEach((code: any) => totals[code] = 0.0);

        let trans: Transaction[] = [];
        this.storage.get(this.config.TRANSACTIONS_FILE).then(async (data)=>{
          if(data){
            trans = data.filter(s => s.meetingid == meetingId);
            trans.forEach(tr => {
              if(params[tr.parameterid] !== undefined){ 
                totals[params[tr.parameterid]] += tr.amount;
                total += tr.amount;
              }
            });
            totals['ALL'] = total;
            resolve(totals);
            return;
          }
          resolve(totals);
        });
      });
    });
  }

}
