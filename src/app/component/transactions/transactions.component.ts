import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { DataProvider } from '../../providers/provider-data';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';
import { TranslateService } from '@ngx-translate/core';
import { LoanInfoComponent } from '../loan-info/loan-info.component';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

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
  single_selected = true;
  loan_info = {
    categories: null,
    notes: null
  }

  constructor(
    private modalCtrl: ModalController,
    private dataProvider: DataProvider,
    private alertCtrl: AlertController,
    private storage: Storage,
    private config: ConfigData,
    private translate: TranslateService
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
      this.single_selected = true;
      //load account's pending operations
      this.storage.get(this.config.TRANSACTIONS_FILE).then((trns)=>{
        if(trns){
          let transactions = trns.filter((s)=>s.accountid == this.account.id && s.meetingid == this.meeting.id);
          if(transactions){
            transactions.forEach((tr)=>{
              this.amount[tr.parameterid] = tr.amount;
              if(tr.categories.length){
                this.loan_info.categories = tr.categories;
              }
              if(tr.notes){
                this.loan_info.notes = tr.notes;
              }
            })
          }
        }
      })
    }else{
      account_type = 1;
      this.translate.get('accounts_selected').subscribe((key)=>{
        this.account_label = '(' + this.accounts.filter( s => s.selected == true).length + ') ' + key;
      });
      this.single_selected = false;
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
    this.translate.get(['confirmation','are_you_sure','no','yes']).subscribe(async (keys: any)=>{
      const alert = await this.alertCtrl.create({
        header: keys['confirmation'],
        message: keys['are_you_sure'],
        buttons: [
          {
            text: keys['no'],
          },
          {
            text: keys['yes'],
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
    });
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
      if(this.amount[operationid] && this.amount[operationid] > 0){
        let parameter = this.parameters.find((s)=> s.id == operationid);
        let operation_name = parameter.name;
        let categories=""; let notes="";
        if(parameter.code == 'EMP'){
          categories = this.loan_info.categories;
          notes = this.loan_info.notes;
        }
        await this.dataProvider.newOperation(
          this.meeting.id, account, this.group, operationid, operation_name, this.amount[operationid], categories, notes
        ).then(async (res: any)=>{
          if(res.status != 'success'){
            this.translate.get(['error','confirm']).subscribe(async (keys: any)=>{
              const alert = await this.alertCtrl.create({
                header: keys['error'],
                message: res.message,
                buttons: [
                {
                  text: keys['confirm'],
                }
                ],
              });
              await alert.present();
            });
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

  async read_amounts(){
    var curLang = this.translate.getCurrentLang();
    //get lang iso code
    curLang = await this.config.AVAILABLE_LANGUAGES.find((l) => l.code == curLang).iso_code;

    await TextToSpeech.speak({
          text: this.account_label,
          lang: curLang,        
          rate: 1.0,           
          pitch: 1.0,     
          volume: 1.0          
        }).then(async ()=>{
          for(let operationid in this.amount){ 
            if(this.amount[operationid] && this.amount[operationid] > 0){
              let parameter = this.parameters.find((s)=> s.id == operationid);
              await TextToSpeech.speak({
                text: parameter.name + ', ' + this.amount[operationid].toString(),
                lang: curLang,        
                rate: 1.0,           
                pitch: 1.0,     
                volume: 1.0          
              });
            }
          }
        })
  }

  async open_loan_info(account){
    const modal = await this.modalCtrl.create({
        component: LoanInfoComponent,
        componentProps: {group: this.group, loan_info: this.loan_info}
    });
    modal.present();

    this.loan_info = (await modal.onWillDismiss() as any).data;
  }

}


  
