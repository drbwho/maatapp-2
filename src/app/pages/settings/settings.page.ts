import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { NavController } from '@ionic/angular';
import { ConfigData } from '../../providers/config-data';
import { TranslateService } from '@ngx-translate/core';
import { Events } from '../../providers/events';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: false
})
export class SettingsPage implements OnInit {
  cur_lang: any;
  available_langs: any;

  constructor(
    private navCtrl: NavController,
    private storage: Storage,
    private config: ConfigData,
    private translate: TranslateService,
    private events: Events,
    private toast: ToastController
  ) { }

  ngOnInit() {
    this.storage.get(this.config.APPLICATION_LANGUAGE).then(res => {
      if(!res){
        this.cur_lang = "en";
      }else{
        this.cur_lang = res;
      }
    });

    this.available_langs = this.config.AVAILABLE_LANGUAGES;
  }

  navBack(){
    this.navCtrl.back();
  }

  updateAppLang(selectedValue: any){
    this.storage.set(this.config.APPLICATION_LANGUAGE, selectedValue.detail.value).then(()=>{
      this.translate.use(selectedValue.detail.value).subscribe(()=>{
        this.events.publish('data:updated', true);
      });
    });
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

}
