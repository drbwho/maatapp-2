import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';
import { Events } from '../../providers/events';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { ModalController, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonList, IonItem, IonLabel } from '@ionic/angular';
import { addIcons } from "ionicons";
import { chevronBackOutline, checkmarkCircle } from "ionicons/icons";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-select-lang',
    templateUrl: './select-lang.component.html',
    styleUrls: ['./select-lang.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonButton,
        IonIcon,
        IonContent,
        IonList,
        IonItem,
        IonLabel
    ]
})
export class SelectLangComponent implements OnInit {
    cur_lang = "";
    available_langs = [];

    constructor(
        private storage: Storage,
        private config: ConfigData,
        private events: Events,
        private translate: TranslateService,
        private modalCtrl: ModalController
    ) {
        addIcons({ chevronBackOutline, checkmarkCircle });
    }

    ngOnInit() {
        this.storage.get(this.config.APPLICATION_LANGUAGE).then(res => {
            if (!res) {
                this.cur_lang = "en";
            } else {
                this.cur_lang = res;
            }
        });

        this.available_langs = this.config.AVAILABLE_LANGUAGES;
    }

    updateAppLang(lang: any) {
        this.storage.set(this.config.APPLICATION_LANGUAGE, lang.code).then(() => {
            this.translate.use(lang.code).subscribe(() => {
                this.events.publish('data:updated', true);
            });
            this.dismiss();
        });
    }

    dismiss() {
        this.modalCtrl.dismiss();
    }
}
