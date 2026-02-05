import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AccountPage } from '../account/account';
import { ActionSheetController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';
import { ToastController } from '@ionic/angular';
import { SelectLangComponent } from '../../component/select-lang/select-lang.component';

@Component({
    templateUrl: 'tabs-page.html',
    standalone: false
})
export class TabsPage {

  constructor(
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController,
    private translate: TranslateService,
    private storage: Storage,
    private config: ConfigData,
    private toast: ToastController
  ){}

  async openAccount(){
    const modal = await this.modalCtrl.create({
        component: AccountPage,
        componentProps: { }
      });
      await modal.present();
      await modal.onWillDismiss();
  }

  async clear_cache(){
    this.storage.remove(this.config.TRANSACTIONS_FILE);
    this.storage.remove(this.config.HISTORY_TRANSACTIONS_FILE);
    this.storage.remove(this.config.UPLOAD_ERRORS_FILE);
    this.storage.remove(this.config.NEWMEETINS_FILE);
    this.storage.remove(this.config.GET_FILE('countries'));
    this.storage.remove(this.config.GET_FILE('meetings'));
    this.storage.remove(this.config.GET_FILE('accounts'));
    this.storage.remove(this.config.GET_FILE('params'));
    const toast = await this.toast.create({
      message: 'Cache cleared!',
      cssClass: 'toast-success',
      duration: 5000
    });
    toast.present();
  }

  async openLanguage() {
    const modal = await this.modalCtrl.create({
      component: SelectLangComponent,
      initialBreakpoint: 0.5,
      breakpoints: [0, 0.5, 0.6], 
      handle: true, 
      cssClass: 'lang-modal-sheet'
    });
    await modal.present();
  }

  async openSettings() {
    this.translate.get(['settings','language','account','clear_cache', 'cancel']).subscribe(async (keys: any)=>{
      const actionSheet = await this.actionSheetCtrl.create({
        header: keys['settings'],
        cssClass: 'settings-action-sheet',
        buttons: [
        {
          text: keys['language'],
          icon: 'globe-outline',
          handler: () => {
            this.openLanguage();
          },
        },
        {
          text: keys['account'],
          icon: 'person-circle-outline',
          handler: () => {
           this.openAccount();
          },
        },
        {
          text: keys['clear_cache'],
          role: 'destructive',
          icon: 'trash-outline',
          handler: () => {
            this.clear_cache();
          },
        },
        {
          text: keys['cancel'],
          role: 'cancel',
          icon: 'close-outline'
        },
        ],
      });
      await actionSheet.present();
    })
  }

}
