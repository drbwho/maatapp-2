import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataProvider } from '../../../../providers/provider-data';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../../../providers/config-data';
import { OperationTools } from '../../../../providers/operation-tools';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  standalone: false
})
export class TransactionsComponent  implements OnInit {
  @Input() account: any;
  @Input() meeting: any;
  @Input() country: any;
  @Input() group: any;
  parameters: any;
  contrib_params: any;
  amount: number[]=[];
  param_balance: any;
  param_extra: any;
  loans_expired = false;
  show_more = false;
  show_details = false;
  tr_icons: any;
  public pf = parseFloat;

  constructor(
    private modalCtrl: ModalController,
    private dataProvider: DataProvider,
    private operTools: OperationTools,
    private storage: Storage,
    private config: ConfigData
  ) { }

  ngOnInit() {
    this.tr_icons = this.operTools.tr_icons;
    var account_type = this.account.type;
    this.dataProvider.fetch_data('params', this.country.id, true).then((data: any)=> {
      this.parameters = data.filter((s) => (account_type == 1 ? s.type == 1 : s.type == 2)); //paysants/group operations
      //this.fsparameters = data.filter((s) => s.type == 3); //solidarity operations
      // default contribs
      this.parameters.forEach(p => {
        if(this.operTools.contrib_operations.includes(p.code)){
          let amount = parseFloat(this.group.settings[this.operTools.map_default_to_settings[p.code]]);
          if(amount){
            p.default = amount;
          }else{
            p.default = 0;
          }
        }
      })
      this.param_balance = this.parameters.find(p => p.code == 'ECP');
      var code = 'DPR';
      if(parseFloat(this.account.restearembourser) > 0){
        code = 'REM';
      }
      this.param_extra = this.parameters.find(p => p.code == code);
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
      if(this.account.dateecheance != null && (new Date(this.account.dateecheance) < (new Date()))){
        this.loans_expired = true;
      }
    }
    this.contrib_params = this.operTools.contrib_operations;
  }

  set_default(parameter: any){
    if(!parameter){ return; } 
    if(parameter.default != undefined){
      this.amount[parameter.id] = parameter.default;
    }
  }

  clear_amount(parameterId: string){
    delete(this.amount[parameterId]);
  }

  dismiss(returndata = false){
    if(returndata){
      this.modalCtrl.dismiss(this.amount);
    }else{
      this.modalCtrl.dismiss();
    }
  }
}
