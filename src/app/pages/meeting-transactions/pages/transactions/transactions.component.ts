import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataProvider } from '../../../../providers/provider-data';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../../../providers/config-data';
import { OperationTools } from '../../../../providers/operation-tools';
import { isThisSecond } from 'date-fns';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  standalone: false
})
export class TransactionsComponent  implements OnInit {
  tr_icons = {'ECP':'wallet-plus', 'RCB':'coins', 'REM':'feather','DPR':'sprout', 'SFREM':'heart-dislike',
    'FIN':'alert', 'ENF':'apps', 'PCO':'logo-apple', 'AST':'school', 'AID':'ribbon', 'SFND':'archive',
    'RCP':'person-remove', 'EMP':'feather', 'SFEMP':'heart', 'AIN':'card', 'CFS':'heart-circle'};
  @Input() account: any;
  @Input() meeting: any;
  @Input() country: any;
  parameters: any;
  contrib_params: any;
  amount: number[]=[];
  param_balance: any;
  param_request: any;
  show_more = false;
  public pf = parseFloat;

  constructor(
    private modalCtrl: ModalController,
    private dataProvider: DataProvider,
    private operTools: OperationTools,
    private storage: Storage,
    private config: ConfigData
  ) { }

  ngOnInit() {
    var account_type = this.account.type;
    this.dataProvider.fetch_data('params', this.country.id, true).then((data: any)=> {
      this.parameters = data.filter((s) => (account_type == 1 ? s.type == 1 : s.type == 2)); //paysants/group operations
      //this.fsparameters = data.filter((s) => s.type == 3); //solidarity operations
      this.param_balance = this.parameters.find(p => p.code == 'ECP');
      this.param_request = this.parameters.find(p => p.code == 'DPR');
    });
    if(this.account){
      //load account's pending operations
      this.storage.get(this.config.TRANSACTIONS_FILE).then((trns)=>{
        if(trns){
          let transactions = trns.filter((s)=>s.accountid == this.account.id && s.meetingid == this.meeting.id);
          if(transactions){
            transactions.forEach((tr)=>{
              this.amount[tr.parameterid] = tr.amount;
              //if(tr.categories.length){
              //  this.loan_info.categories = tr.categories;
              //}
              //if(tr.notes){
               // this.loan_info.notes = tr.notes;
              //}
            })
          }
        }
      })
    }
    this.contrib_params = this.operTools.contrib_operations;
  }

  clear_amount(parameterId: string){
    this.amount[parameterId] = 0;
  }

  toggleMore(){
    this.show_more = !this.show_more;
  }

  dismiss(){
    this.modalCtrl.dismiss();
  }
}
