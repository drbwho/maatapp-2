import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from './config-data';
import { DataProvider } from './provider-data';

export interface AccountTotals {
  credit?: number,
  balance?: number,
  cash?: number
};

@Injectable({
  providedIn: 'root'
})
export class OperationTools {
  credit_operations = ['ECP', 'RCB', 'REM', 'SFREM', 'FIN', 'ENF', 'PCO', 'CFS', 'AST', 'AID', 'SFND'];
  debit_operations = ['RCP', 'EMP', 'SFEMP', 'AIN'];

  constructor(
    private storage: Storage,
    private config: ConfigData,
    private dataProvider: DataProvider
  ) { }

  /*
  * Estimate Account totals from pending transactions
  *
  */
  estimate_account_totals (account: any, meetingid: any): any {
    return new Promise((resolve)=>{
      let totals: AccountTotals = {
        credit: 0.00,
        balance: 0.00,
        cash: 0.00
      };
      let trans = [];
      this.storage.get(this.config.TRANSACTIONS_FILE).then(async (data)=>{
        if(data){
          trans = data.filter(s=>s.meetingid == meetingid);
        }
        let params = await this.storage.get(this.config.GET_FILE('params'));
        totals.credit = parseFloat(account.creditdisponible);
        totals.balance = parseFloat(account.balance);
        totals.cash = 0.00;
        trans.forEach((tr)=>{
          let pcode = (params.find((s) => s.id == tr.parameterid)).code;
          if(this.credit_operations.includes(pcode)){
            totals.credit += parseFloat(tr.amount);
            totals.balance += parseFloat(tr.amount);
            totals.cash += parseFloat(tr.amount);
          }else if(this.debit_operations.includes(pcode)){
            totals.credit -= parseFloat(tr.amount);
            totals.balance -= parseFloat(tr.amount);
            totals.cash -= parseFloat(tr.amount);
          }
        });
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
      let group_totals = await this.estimate_account_totals(group_account, transaction.meetingid);
      switch(pcode){
        case 'EMP':
          if(transaction.amount > account.creditdisponible){
            resolve({'status': 'error', 'message': 'Loan exceeds credit available'})
          }
          if(transaction.amount > group_totals.credit){
            resolve({'status': 'error', 'message': 'Loan exceeds group credit available'})
          }
          break;
        case 'SFEMP':
          if(transaction.amount > account.creditdisponible){
            resolve({'status': 'error', 'message': 'Loan exceeds SF credit available'})
          }
          if(transaction.amount > group_totals.credit){
            resolve({'status': 'error', 'message': 'Loan exceeds group credit available'})
          }
          break;
        case 'REM':
          if(transaction.amount > account.restearembourser){
            resolve({'status': 'error', 'message': 'Reimbursement exceeds loan debt'})
          }
          break;
        case 'SFREM':
          if(transaction.amount > account.sfrestearembourser){
            resolve({'status': 'error', 'message': 'Reimbursement exceeds SF loan debt'})
          }
          break;
        case 'RCP':
          if(transaction.amount > account.balance){
            resolve({'status': 'error', 'message': 'Withdrawal exceeds balance'})
          }
          break;
      }

      //Group transactions
      let groupops = ['AIN', 'CFS', 'RCPM', 'REMM', 'EMPM'];
      if(groupops.includes(pcode)){
        if(transaction.amount > group_totals.credit){
          resolve({'status': 'error', 'message': 'Amount exceeds group credit available'})
        }
      }

      resolve({'status':'success'});
    }) 
  }

}
