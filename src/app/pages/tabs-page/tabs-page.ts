import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AccountPage } from '../account/account';

@Component({
    templateUrl: 'tabs-page.html',
    standalone: false
})
export class TabsPage {

  constructor(
    private modalCtrl: ModalController
  ){}

  async openAccount(){
    const modal = await this.modalCtrl.create({
        component: AccountPage,
        componentProps: { }
      });
      await modal.present();
      await modal.onWillDismiss();
  }

}
