import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ModalController, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonList, IonItem, IonLabel, IonNote } from '@ionic/angular';
import { addIcons } from "ionicons";
import { chevronBackOutline } from "ionicons/icons";
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonButton,
        IonIcon,
        IonContent,
        IonList,
        IonItem,
        IonLabel,
        IonNote
    ]
})
export class HistoryComponent implements OnInit {
    @Input() account: any;
    @Input() transactions: any;
    @Input() currencty: string;

    constructor(
        private modalCtrl: ModalController,
    ) {
        addIcons({ chevronBackOutline });
    }

    ngOnInit() {
    }

    dismiss() {
        this.modalCtrl.dismiss();
    }

}
