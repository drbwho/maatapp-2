import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { DataProvider } from '../../providers/provider-data';
import { async } from 'rxjs';

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
      this.parameters = data.filter((s) => s.type == 1); //paysants operations
      this.fsparameters = data.filter((s) => s.type == 3); //solidarity operations
    });
  }

  dismiss(data = false) {
    // using the injected ModalController this page
    // can "dismiss" itself and pass back data
    this.modalCtrl.dismiss(data);
  }

  async valider(){
      const alert = await this.alertCtrl.create({
        header: 'Êtes-vous sûr?',
        buttons: [
          {
            text: 'Non',
          },
          {
            text: 'Oui',
            handler: () => {
              this.submit_operation();
            },
          },
        ],
      });
      await alert.present();
  }

  async submit_operation(){
    if(!this.amount){
      const alert = await this.alertCtrl.create({
        header: 'Erreur',
        message: 'Le montant doit être supérieur à zéro',
        buttons: [
          {
            text: 'Confirmer',
          }
        ],
      });
      await alert.present();
      return;
    }

    this.dataProvider.newOperation(this.meeting.id, this.account.id, this.operation, this.amount).then(async (res: any)=>{
      if(res.status != 'success'){
        const alert = await this.alertCtrl.create({
          header: 'Erreur',
          message: res.message,
          buttons: [
            {
              text: 'Confirmer',
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
