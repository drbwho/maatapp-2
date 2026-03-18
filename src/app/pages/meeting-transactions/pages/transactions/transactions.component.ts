import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataProvider } from '../../../../providers/provider-data';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../../../providers/config-data';
import { OperationTools } from '../../../../providers/operation-tools';
import { Transaction } from '../../../../interfaces/data-interfaces';

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
  @Input() visible_params?: any;
  parameters: any;
  contrib_params: any;
  amount: number[]=[];
  param_error: string[]=[];
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
        p.showdefault = false;
        if(this.operTools.contrib_operations.includes(p.code)){
          let amount = parseFloat(this.group.settings[this.operTools.map_default_to_settings[p.code]]);
          if(amount){
            p.default = amount;
          }else{
            p.default = 0;
          }
          p.showdefault = true;
        }
      })
    });
    if(this.account){
      //load account's pending operations
      this.storage.get(this.config.TRANSACTIONS_FILE).then((trns)=>{
        if(trns){
          let transactions = trns.filter((s)=> s.idaccount == this.account.id && s.idmeeting == this.meeting.id);
          if(transactions){
            transactions.forEach((tr)=>{
              this.amount[tr.idparameter] = tr.amount;
              //if(tr.categories.length){
              //  this.loan_info.categories = tr.categories;
              //}
              //if(tr.notes){
               // this.loan_info.notes = tr.notes;
              //}
            })
          }
        }
      });
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

  async dismiss(returndata = false){
    if(returndata){
      if(await this.check_operations()){
        this.modalCtrl.dismiss(this.amount);
      }
    }else{
      this.modalCtrl.dismiss();
    }
  }

  async check_operations(){
    let check = true;
    for (const [parameterId, amount] of Object.entries(this.amount)) {
      let param = this.parameters.find(p => p.id == parameterId);
      let tr: Transaction = {
        idmeeting: this.meeting.id,
        idaccount: this.account.id,
        idparameter: param.id,
        parametername: param.name,
        amount: amount,
        inputdate: new Date()
      }
      let result: any = await this.operTools.check_operation(this.account, this.group, tr);
      if(result.status != 'success'){
        this.param_error[param.id] = result.message;
        check = false;
      }
    }
    return check;
  }
}
