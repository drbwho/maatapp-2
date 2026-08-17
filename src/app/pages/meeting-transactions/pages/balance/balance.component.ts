import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { OperationTools } from '../../../../providers/operation-tools';
import { TransactionsComponent } from '../transactions/transactions.component';
import { AccountInfoComponent } from '../../../../component/account-info/account-info.component';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class BalanceComponent  implements OnInit {
  @Input() group: any;
  @Input() accounts: any;
  @Input() country: any;
  @Input() meeting: any;
  numberofmembers = 0;
  attendance = 0;
  meetingBalance = 0;
  parameters: any = {};
  param_balance: any;
  amount: any = {};

  constructor(
    private modalCtrl: ModalController,
    private operationTools: OperationTools,
  ) { }

  ngOnInit() {
    this.numberofmembers = this.group.numberofmembers;
    this.accounts = this.accounts.filter(m => m.isPresent);
    this.attendance = this.accounts.length;
    this.parameters = this.country.parameters;
    this.param_balance = this.parameters.find(p => p.code == 'ECP');

    this.readTotals();
  }

  async readTotals(account = null){
    let meetingTotals = await this.operationTools.estimate_meeting_totals(null, this.meeting.id);
    this.meetingBalance = meetingTotals.transactions.get('ECP');

    if(account){
      let acctotals = await this.operationTools.estimate_meeting_totals(account, this.meeting.id);
      account.ecp = acctotals.transactions.get('ECP');
    }else{
      this.accounts.forEach(async acc => {
        let acctotals = await this.operationTools.estimate_meeting_totals(acc, this.meeting.id);
        acc.ecp = acctotals.transactions.get('ECP');
      });
    }
  }

  async clear_amount(account: any){
    await this.operationTools.delOperationByParameter(account.id, this.meeting.id, this.param_balance.id);
    this.readTotals(account);
  }

  async openAccountTransactions(account: any){
    let categories=""; let notes="";

    const modal = await this.modalCtrl.create({
      component: TransactionsComponent,
      componentProps: {group: this.group, account: account, meeting: this.meeting, country: this.country, visible_params: ['ECP']}
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
          this.operationTools.show_alert(account.owner + ': ' + result.message);
        }
      }
      this.readTotals(account);
    }
  }

  async showAccountInfo(account, slideitem){
    slideitem.close();
    const modal = await this.modalCtrl.create({
      component: AccountInfoComponent,
      initialBreakpoint: 0.7,
      breakpoints: [0, 0.7, 1],
      componentProps: {'account': account, 'currency': this.country.currency},
      cssClass: 'action-modal-sheet'
    });
    modal.present();

    await modal.onWillDismiss();
  }

}
