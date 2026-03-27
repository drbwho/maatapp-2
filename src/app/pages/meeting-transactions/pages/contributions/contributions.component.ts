import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataProvider } from '../../../../providers/provider-data';
import { OperationTools } from '../../../../providers/operation-tools';
import { TransactionsComponent } from '../transactions/transactions.component';
import { AccountInfoComponent } from '../../../../component/account-info/account-info.component';

@Component({
  selector: 'app-contributions',
  templateUrl: './contributions.component.html',
  styleUrls: ['./contributions.component.scss'],
  standalone: false
})
export class ContributionsComponent  implements OnInit {
  @Input() group: any;
  @Input() accounts: any;
  @Input() country: any;
  @Input() meeting: any;
  numberofmembers = 0;
  attendance = 0;
  parameters: any;
  totals:any = {};
  meetingTotals: any = {};
  selectAll = false;
  contribsExist = false;

  constructor(
    private modalCtrl: ModalController,
    private dataProvider: DataProvider,
    private operationTools: OperationTools
  ) { }

  async ngOnInit() {
    this.numberofmembers = this.group.numberofmembers;
    this.accounts = this.accounts.filter(m => m.isPresent);
    this.attendance = this.accounts.length;
    this.resetTotals();
    await this.readTotals();

    this.dataProvider.fetch_data('params', this.country.id, true).then((data: any)=> {
      this.parameters = data;
    });
  }

  onSelectAllChange() {
    this.accounts.forEach(acc => acc.selected = this.selectAll);
    this.submit_contrib_operations();
  }

  toggleAccount(acc: any) {
    acc.selected = !acc.selected;
    this.submit_contrib_operations(acc);
  }

  resetTotals(){
    this.operationTools.contrib_operations.forEach(c => this.totals[c] = 0.0);
  }

  async readTotals(){
    this.meetingTotals = await this.operationTools.estimate_meeting_totals(null, this.meeting.id);
    this.contribsExist =
      this.meetingTotals.transactions.get('RCB')
      + this.meetingTotals.transactions.get('AID')
      + this.meetingTotals.transactions.get('AST') > 0 ? true : false;

    this.accounts.forEach(async acc => {
      acc.totals = await this.operationTools.estimate_meeting_totals(acc, this.meeting.id);
    });
  }


  async submit_contrib_operations(account:any = null){
    let contribs = this.operationTools.contrib_operations;
    let params = this.parameters.filter(p => contribs.includes(p.code));
    let amount = 0;
    let categories=""; let notes="";
    this.resetTotals();
    let result;
    // use for() with awaits!!!!
    for (const prm of params){
      amount = parseFloat(this.group.settings[this.operationTools.map_default_to_settings[prm.code]]);
      if(account){
        // treat specific account
        if(account.selected){
          result = await this.operationTools.newOperation(
              this.meeting.id, account, this.group, prm.id, prm.name, amount, categories, notes);
          if(result.status != 'success'){
            this.operationTools.show_alert(account.owner +': '+ result.message);
          }
        }else{
          await this.operationTools.delOperationByParameter(account.id, this.meeting.id, prm.id);
        }
      }else{
        for (const acc of this.accounts){
          if(acc.selected){
            // add contributions for selected accounts
            result = await this.operationTools.newOperation(
                this.meeting.id, acc, this.group, prm.id, prm.name, amount, categories, notes);
            if(result.status != 'success'){
              this.operationTools.show_alert(acc.owner +': '+ result.message);
            }
          }else{
            // remove from the rest
            await this.operationTools.delOperationByParameter(acc.id, this.meeting.id, prm.id);
          }
        }
      };
    }
    this.readTotals();
  }

  async openAccountTransactions(account: any){
    let categories=""; let notes="";

    let visible_params = this.operationTools.contrib_operations;

    const modal = await this.modalCtrl.create({
      component: TransactionsComponent,
      componentProps: {group: this.group, account: account, meeting: this.meeting, country: this.country, visible_params: visible_params}
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
          this.operationTools.show_alert(account.owner +': '+ result.message);
        }
      }
      this.readTotals();
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
