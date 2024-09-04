import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { DataProvider } from '../../providers/provider-data';

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
  amount: number;

  constructor(
    private modalCtrl: ModalController,
    private dataProvider: DataProvider,
    private alertCtrl: AlertController
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
  }

  dismiss(data = false) {
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
              this.submit_operation();
            },
          },
        ],
      });
      await alert.present();
  }

  async submit_operation(){
    if(!this.amount || !this.operation){
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
    }

    let operation_name = (this.parameters.find((s)=> s.id == this.operation)).name;
    this.dataProvider.newOperation(this.meeting.id, this.account, this.group, this.operation, operation_name, this.amount).then(async (res: any)=>{
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
      }else{
        this.modalCtrl.dismiss(true);
      }
    });
  }

}
