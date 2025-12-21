import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from './config-data';
import { TranslateService } from '@ngx-translate/core';

export interface AccountTotals {
  credit?: number,
  balance?: number,
  cash?: number
};

@Injectable({
  providedIn: 'root'
})
export class OperationTools {
  credit_operations = ['ECP', 'RCB', 'REM', 'SFREM', 'FIN', 'ENF', 'PCO', 'AST', 'AID', 'SFND'];
  debit_operations = ['RCP', 'EMP', 'SFEMP', 'AIN', 'CFS'];

  constructor(
    private storage: Storage,
    private config: ConfigData,
    private translate: TranslateService
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
        });
        // iterate already uploaded transactions
        let uploaded_transactions = await this.storage.get(this.config.HISTORY_TRANSACTIONS_FILE);
        if(uploaded_transactions && uploaded_transactions.length){
          uploaded_transactions = uploaded_transactions.filter(s => s.idmeeting == meetingid);
          if(uploaded_transactions.length){
            uploaded_transactions.forEach((tr)=>{
              let pcode = (params.find((s) => s.id == tr.idparameter)).code;
              // calculate only cash from uploaded transactions
              if(this.credit_operations.includes(pcode)){
                totals.cash += parseFloat(tr.credit ? tr.credit : tr.debit);
              }else if(this.debit_operations.includes(pcode)){
                totals.cash -= parseFloat(tr.credit ? tr.credit : tr.debit);
              }
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
      let group_totals = await this.estimate_account_totals(group_account, transaction.meetingid);
      switch(pcode){
        case 'EMP':console.log(group.settings.credit_borrow_multiplier);
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

}
