import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';
import { Events } from '../../providers/events';
import { TranslateService } from '@ngx-translate/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-select-lang',
  templateUrl: './select-lang.component.html',
  styleUrls: ['./select-lang.component.scss'],
  standalone: false
})
export class SelectLangComponent  implements OnInit {
  cur_lang = "";
  available_langs = [];

  constructor(
    private storage: Storage,
    private config: ConfigData,
    private events: Events,
    private translate: TranslateService,
    private modalCtrl: ModalController
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

  updateAppLang(lang: any){
    this.storage.set(this.config.APPLICATION_LANGUAGE, lang.code).then(()=>{
      this.translate.use(lang.code).subscribe(()=>{
        this.events.publish('data:updated', true);
      });
      this.dismiss();
    });
  }

  dismiss(){
    this.modalCtrl.dismiss();
  }
}
