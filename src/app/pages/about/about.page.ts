import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { DataProvider } from '../../providers/provider-data';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { addIcons } from "ionicons";
import { closeOutline } from "ionicons/icons";
import { IonHeader, IonToolbar, IonButtons, IonButton, IonIcon, IonContent, IonText, IonFooter } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'about',
    templateUrl: './about.page.html',
    styleUrls: ['./about.page.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        IonHeader,
        IonToolbar,
        IonButtons,
        IonButton,
        IonIcon,
        IonContent,
        IonText,
        IonFooter,
        RouterLink
    ]
})

export class AboutPage implements OnInit {
    curLang: string;
    confdata =
        {
            'title': '',
            'body': '',
            'venue': '',
            'datefrom': '',
            'dateto': ''
        };

    constructor(public dataProvider: DataProvider, private translate: TranslateService) {
        addIcons({ closeOutline });
    }

    ngOnInit() { }

    ionViewWillEnter() {
        this.curLang = (this.translate.currentLang() ? this.translate.currentLang() : 'en');
    }

}
