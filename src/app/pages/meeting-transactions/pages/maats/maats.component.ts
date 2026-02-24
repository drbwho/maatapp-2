import { Component, OnInit, Input } from '@angular/core';
import { TransactionsComponent } from '../transactions/transactions.component';
import { DataProvider } from '../../../../providers/provider-data';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../../../providers/config-data';
import { ModalController } from '@ionic/angular';
import { OperationTools } from '../../../../providers/operation-tools';
import { LoanInfoComponent } from '../../../../component/loan-info/loan-info.component';

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
    private operationTools: OperationTools
  ) { }

  ngOnInit() {
    this.numberofmembers = this.group.numberofmembers;
    this.accounts = this.accounts.filter(m => m.isPresent);
    this.attendance = this.accounts.length;

    this.allAcounts = this.accounts;
    this.loanAccounts = this.allAcounts.filter(a => parseFloat(a.restearembourser) > 0);
    this.creditAccounts = this.allAcounts.filter(a => parseFloat(a.creditdisponible) > 0);

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
              s.accountid == acc.id && s.meetingid == this.meeting.id && s.parameterid == this.param_rem.id);
          if(trrem){
            acc.rem = trrem.amount;
            this.reimbursements++;
          }else{
            delete(acc.rem);
          }
          let tremp = trns.find((s)=>
              s.accountid == acc.id && s.meetingid == this.meeting.id && s.parameterid == this.param_emp.id);
          if(tremp){
            acc.emp = tremp.amount;
          }else{
            delete(acc.emp);
          }
        }
      })
      if(acc.dateecheance != null && (new Date(acc.dateecheance) < (new Date()))){
        acc.loans_expired = true;
      }
    });
  }

  async clear_amount(account: any, emp = false){
    if(emp){
      await this.operationTools.delOperationByParameter(account.id, this.meeting.id, this.param_emp.id);
    }else{
      await this.operationTools.delOperationByParameter(account.id, this.meeting.id, this.param_rem.id);  
    }
    this.readTotals();
  }

  async set_default(account: any){
    let categories="", notes="";
    await this.operationTools.newOperation(
          this.meeting.id, account, this.group, this.param_rem.id, this.param_rem.name, account.restearembourser, categories, notes);
    this.readTotals();
  }

  async openNewMaat(account: any){
    const modal = await this.modalCtrl.create({
        component: LoanInfoComponent,
        componentProps: {account: account },
        initialBreakpoint: 0.3,
        breakpoints: [0, 0.3, 0.5],
        handle: true,
        cssClass: 'lang-modal-sheet'
      });
      await modal.present();

      let loan_info = (await modal.onWillDismiss()).data as string;
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
        await this.operationTools.newOperation(
          this.meeting.id, account, this.group, parm_id, prm.name, amount, categories, notes);
      }
      this.readTotals();
    }
  }

}
