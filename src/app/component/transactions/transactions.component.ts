import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { DataProvider } from '../../providers/provider-data';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
})
export class TransactionsComponent  implements OnInit {
  @Input() account: any;
  meeting: any;
  group: any;
  country: any;
  meetingplace: string;
  meetingdate: string;
  parameters: any;
  fsparameters: any;
  operation: string;
  amount: number[]=[];

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

    this.dataProvider.fetch_data('params', this.country.id, true).then((data: any)=> {
      this.parameters = data.filter((s) => (this.account.type == 1 ? s.type == 1 : s.type == 2)); //paysants/group operations
      //this.fsparameters = data.filter((s) => s.type == 3); //solidarity operations
    });

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
            handler: () => {
              this.submit_operations();
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

  async submit_operations(){
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
        await this.dataProvider.newOperation(this.meeting.id, this.account, this.group, operationid, operation_name, this.amount[operationid]).then(async (res: any)=>{
        //this.dataProvider.newOperation(this.meeting.id, this.account, this.group, this.operation, operation_name, this.amount).then(async (res: any)=>{
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
    if(success){
      this.modalCtrl.dismiss(true);
    }
  }
}
