import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { DataProvider } from '../../providers/provider-data';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';

@Component({
    selector: 'app-transactions',
    templateUrl: './transactions.component.html',
    styleUrls: ['./transactions.component.scss'],
    standalone: false
})
export class TransactionsComponent  implements OnInit {
  tr_icons = {'ECP':'person-add', 'RCB':'analytics', 'REM':'flash-off','DPR':'server', 'SFREM':'heart-dislike',
    'FIN':'alert', 'ENF':'apps', 'PCO':'logo-apple', 'AST':'man', 'AID':'heart-half', 'SFND':'archive',
    'RCP':'person-remove', 'EMP':'flash', 'SFEMP':'heart', 'AIN':'card', 'CFS':'heart-circle'};
  @Input() account: any;
  @Input() accounts: any;
  meeting: any;
  group: any;
  country: any;
  meetingplace: string;
  meetingdate: string;
  parameters: any;
  fsparameters: any;
  operation: string;
  amount: number[]=[];
  account_label = '';
  completed = true;

  constructor(
    private modalCtrl: ModalController,
    private dataProvider: DataProvider,
    private alertCtrl: AlertController,
    private storage: Storage,
    private config: ConfigData
  ) { }

  ngOnInit() {}

  ionViewWillEnter() {

    this.meeting = this.dataProvider.current.meeting;
    this.meetingplace = this.meeting.place;
    this.meetingdate = this.meeting.startedat;
    this.group = this.dataProvider.current.group;
    this.country = this.dataProvider.current.country;

    var account_type;
    //batch transactions?
    if(this.account){
      account_type = this.account.type;
      this.account_label = this.account.owner;
      //load account's pending operations
      this.storage.get(this.config.TRANSACTIONS_FILE).then((trns)=>{
        if(trns){
          let transactions = trns.filter((s)=>s.accountid == this.account.id && s.meetingid == this.meeting.id);
          if(transactions){
            transactions.forEach((tr)=>{
              this.amount[tr.parameterid] = tr.amount;
            })
          }
        }
      })
    }else{
      account_type = 1;
      this.account_label = '(' + this.accounts.filter( s => s.selected == true).length + ') accounts selected'
    }

    this.dataProvider.fetch_data('params', this.country.id, true).then((data: any)=> {
      this.parameters = data.filter((s) => (account_type == 1 ? s.type == 1 : s.type == 2)); //paysants/group operations
      //this.fsparameters = data.filter((s) => s.type == 3); //solidarity operations
    });
  }

  dismiss(data = true) {
    // using the injected ModalController this page
    // can "dismiss" itself and pass back data
    this.modalCtrl.dismiss(data);
  }

  async valider(){
      const alert = await this.alertCtrl.create({
        header: 'Confirmation',
        message: 'Are you sure?',
        buttons: [
          {
            text: 'No',
          },
          {
            text: 'Yes',
            handler: async () => {
              if(this.account){
                this.submit_operations(this.account, true);
              }else{
                // batch transations
                for(const s of this.accounts.filter( a => a.selected === true)){
                  await this.submit_operations(s, false);
                }
                if(this.completed){
                  this.modalCtrl.dismiss(true);
                }
              }
            },
          },
        ],
      });
      await alert.present();
  }

  //Update regular contributions' amounts
  is_cntrb_field(parameter_code){
    let cntrb_fields = ['RCB', 'AID', 'AST', 'ENF'];
    return cntrb_fields.includes(parameter_code);
  }

  update_cntrb(parameter_code, parameter_id){
    let amount = 0;
    switch(parameter_code){
      case 'RCB':
        amount = this.group.settings.regcontribution;
        break;
      case 'AID':
        amount = this.group.settings.regsfcontribution;
        break;
      case 'AST':
        amount = this.group.settings.regfacilpayment;
        break;
      case 'ENF':
        amount = this.group.settings.entryfee;
        break;
    }
    this.amount[parameter_id] = amount;
  }

  async submit_operations(account, dismiss = true){
    /*if(!this.amount || !this.operation){
      const alert = await this.alertCtrl.create({
        header: 'Error',
        message: !this.amount ? 'Amount cannot be zero' : 'Please select a transaction!',
        buttons: [
          {
            text: 'Confirm',
          }
        ],
      });
      await alert.present();
      return;
    }*/
    let success = true;
    for(let operationid in this.amount){
      if(this.amount[operationid]){
        let operation_name = (this.parameters.find((s)=> s.id == operationid)).name;
        await this.dataProvider.newOperation(this.meeting.id, account, this.group, operationid, operation_name, this.amount[operationid]).then(async (res: any)=>{
          if(res.status != 'success'){
            const alert = await this.alertCtrl.create({
              header: 'Error',
              message: res.message,
              buttons: [
                {
                  text: 'Confirm',
                }
              ],
            });
            await alert.present();
            success = false;
          }//else{
            //this.modalCtrl.dismiss(true);
          //}
        });
      }
    }
    if(success && dismiss){
      this.modalCtrl.dismiss(true);
    }else{
      if(!success){
        this.completed = success;
      }
    }
  }
}
