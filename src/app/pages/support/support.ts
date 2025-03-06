import { Component, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';

import { AlertController, ToastController } from '@ionic/angular';
import { DataProvider } from '../../providers/provider-data';


@Component({
    selector: 'page-support',
    templateUrl: 'support.html',
    styleUrls: ['./support.scss'],
    standalone: false
})
export class SupportPage {
  submitted = false;
  supportMessage: string;
  tickets = [];

  constructor(
    public alertCtrl: AlertController,
    public toastCtrl: ToastController,
    private dataProvider: DataProvider,
  ) { }

  ionViewWillEnter() {
    this.update_tickets();
  }

  update_tickets(){
    this.dataProvider.getTickets().then((data: any)=> {this.tickets = data;});
  }

  async submit(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      this.submitted = false;

      this.dataProvider.newTicket(this.supportMessage).then(async (res:any)=>{
        if(res.status != undefined && res.status == 'error'){
          const alert = await this.alertCtrl.create({
            header: "Error",
            message: res.message,
            buttons: [
              {
                text: 'Ok',
              },
            ],
          });
          await alert.present();
          return;
        }else{
          this.supportMessage = '';
          const toast = await this.toastCtrl.create({
            message: 'Your support request has been sent.',
            cssClass: 'toast-success',
            duration: 3000
          });
          await toast.present();
          this.update_tickets();
          return;
        }
      })
    }
  }

  // If the user enters text in the support question and then navigates
  // without submitting first, ask if they meant to leave the page
  // async ionViewCanLeave(): Promise<boolean> {
  //   // If the support message is empty we should just navigate
  //   if (!this.supportMessage || this.supportMessage.trim().length === 0) {
  //     return true;
  //   }

  //   return new Promise((resolve: any, reject: any) => {
  //     const alert = await this.alertCtrl.create({
  //       title: 'Leave this page?',
  //       message: 'Are you sure you want to leave this page? Your support message will not be submitted.',
  //       buttons: [
  //         { text: 'Stay', handler: reject },
  //         { text: 'Leave', role: 'cancel', handler: resolve }
  //       ]
  //     });

  //     await alert.present();
  //   });
  // }
}
