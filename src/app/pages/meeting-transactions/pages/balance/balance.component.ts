import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { OperationTools } from '../../../../providers/operation-tools';
import { DataProvider } from '../../../../providers/provider-data';
import { TransactionsComponent } from '../transactions/transactions.component';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../../../providers/config-data';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.scss'],
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
    private dataProvider: DataProvider,
    private storage: Storage,
    private config: ConfigData
  ) { }

  ngOnInit() {
    this.numberofmembers = this.group.numberofmembers;
    this.accounts = this.accounts.filter(m => m.isPresent);
    this.attendance = this.accounts.length;

    this.dataProvider.fetch_data('params', this.country.id, true).then((data: any)=> {
      this.parameters = data;
      this.param_balance = this.parameters.find(p => p.code == 'ECP');
      this.readTotals();
    });
  }

  async readTotals(){
    this.meetingBalance = 0;
    this.accounts.forEach(acc => {
      this.storage.get(this.config.TRANSACTIONS_FILE).then((trns)=>{
        if(trns){
          let trbalance = trns.find((s)=>
              s.accountid == acc.id && s.meetingid == this.meeting.id && s.parameterid == this.param_balance.id);
          if(trbalance){
            acc.ecp = trbalance.amount;
            this.meetingBalance += trbalance.amount;
          }else{
            delete(acc.ecp);
          }
        }
      })
    });
  }

  async clear_amount(account: any){
    await this.operationTools.delOperationByParameter(account.id, this.meeting.id, this.param_balance.id);
    this.readTotals();
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
          this.operationTools.show_alert(account.owner + ': ' + result.message);
        }
      }
      this.readTotals();
    }
  }

}
