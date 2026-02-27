import { Component, OnInit, Input } from '@angular/core';
import { TransactionsComponent } from '../transactions/transactions.component';
import { DataProvider } from '../../../../providers/provider-data';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../../../providers/config-data';
import { AlertController, ModalController } from '@ionic/angular';
import { OperationTools } from '../../../../providers/operation-tools';
import { LoanInfoComponent } from '../../../../component/loan-info/loan-info.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-maats',
  templateUrl: './maats.component.html',
  styleUrls: ['./maats.component.scss'],
  standalone: false
})
export class MaatsComponent  implements OnInit {
  @Input() group: any;
  @Input() accounts: any;
  @Input() country: any;
  @Input() meeting: any;
  allAcounts: any;
  loanAccounts: any;
  creditAccounts: any;
  numberofmembers = 0;
  parameters: any;
  attendance = 0;
  param_rem: any;
  param_emp: any;
  segment = 'reimbursements';
  reimbursements = 0;
  public pf = parseFloat;

  constructor(
    private dataProvider: DataProvider,
    private storage: Storage,
    private config: ConfigData,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private operationTools: OperationTools
  ) { }

  ngOnInit() {
    this.numberofmembers = this.group.numberofmembers;
    this.accounts = this.accounts.filter(m => m.isPresent);
    this.attendance = this.accounts.length;

    this.allAcounts = this.accounts;
    this.loanAccounts = this.allAcounts.filter(a => parseFloat(a.restearembourser) > 0);

    this.dataProvider.fetch_data('params', this.country.id, true).then((data: any)=> {
      this.parameters = data;
      this.param_rem = this.parameters.find(p => p.code == 'REM');
      this.param_emp = this.parameters.find(p => p.code == 'EMP');
      this.readTotals();
    });
  }

  async readTotals(){
    this.reimbursements = 0;
    this.accounts.forEach(acc => {
      this.storage.get(this.config.TRANSACTIONS_FILE).then((trns)=>{
        if(trns){
          let trrem = trns.find((s)=>
              s.idaccount == acc.id && s.idmeeting == this.meeting.id && s.idparameter == this.param_rem.id);
          if(trrem){
            acc.rem = trrem.amount;
            this.reimbursements++;
          }else{
            delete(acc.rem);
          }
          let tremp = trns.find((s)=>
              s.idaccount == acc.id && s.idmeeting == this.meeting.id && s.idparameter == this.param_emp.id);
          if(tremp){
            acc.emp = tremp.amount;
            acc.emp_notes = tremp.notes;
          }else{
            delete(acc.emp);
            delete(acc.emp_notes);
          }
        }
      })
      if(acc.dateecheance != null && (new Date(acc.dateecheance) < (new Date()))){
        acc.loans_expired = true;
      }
    });
  }

  async clear_amount(account: any){
    await this.operationTools.delOperationByParameter(account.id, this.meeting.id, this.param_rem.id);
    this.readTotals();
  }

  async clear_loan_amount(account: any, event: Event){
    event.stopPropagation();
    await this.operationTools.delOperationByParameter(account.id, this.meeting.id, this.param_emp.id);
    this.readTotals();
  }

  async set_default(account: any){
    let categories="", notes="";
    await this.operationTools.newOperation(
      this.meeting.id, account, this.group, this.param_rem.id, this.param_rem.name, account.restearembourser, categories, notes);
    this.readTotals();
  }

  /*
  * Register new loan
  *
  */
  async openNewMaat(account: any){
    let loan_info: any = {};
    if(account.emp){
      loan_info.amount = account.emp;
    }
    if(account.emp_notes){
      loan_info.notes = account.emp_notes;
    }
    const modal = await this.modalCtrl.create({
        component: LoanInfoComponent,
        componentProps: {account: account, country: this.country, loan_info: loan_info },
        initialBreakpoint: 0.5,
        breakpoints: [0, 0.5, 0.7],
        handle: true,
        cssClass: 'lang-modal-sheet'
      });
      await modal.present();

      loan_info = (await modal.onWillDismiss()).data as string;
      if(loan_info){
        let result = await this.operationTools.newOperation(
          this.meeting.id, account, this.group, this.param_emp.id, this.param_emp.name, loan_info.amount, "", loan_info.notes);
        if(result.status != 'success'){
          this.operationTools.show_alert(result.message);
        }
        this.readTotals();
      }
  }

  async openAccountTransactions(account: any){
    let categories=""; let notes="";

    const modal = await this.modalCtrl.create({
      component: TransactionsComponent,
      componentProps: {group: this.group, account: account, meeting: this.meeting, country: this.country}
    });
    modal.present();

    let acc_transactions = (await modal.onWillDismiss() as any).data;

    // save transactions
    if(acc_transactions){
      // first clear previous transactions
      await this.operationTools.delAccountOperations(account, this.meeting);
      for (const [parm_id, amount] of Object.entries(acc_transactions)) {
        let prm = this.parameters.find(p => p.id === parm_id);
        let result = await this.operationTools.newOperation(
          this.meeting.id, account, this.group, parm_id, prm.name, amount, categories, notes);
        if(result.status != 'success'){
          this.operationTools.show_alert(result.message);
        }
      }
      this.readTotals();
    }
  }

}
