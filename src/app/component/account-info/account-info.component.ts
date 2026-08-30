import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ModalController, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonCard, IonCardContent, IonGrid, IonRow, IonCol, IonText } from '@ionic/angular';
import { CommonModule } from '@angular/common';

// needed fot translate pipe activation
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from "ionicons";
import { chevronBackOutline, swapHorizontalOutline } from "ionicons/icons";

@Component({
    selector: 'app-account-info',
    templateUrl: './account-info.component.html',
    styleUrls: ['./account-info.component.scss'],
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
        IonCard,
        IonCardContent,
        IonGrid,
        IonRow,
        IonCol,
        IonText
    ]
})
export class AccountInfoComponent implements OnInit {
    @Input() account: any;
    @Input() country: any;

    show_details = false;
    loans_expired = false;
    sfloans_expired = false;
    public pf = parseFloat;

    constructor(private modalCtrl: ModalController) {
        addIcons({ chevronBackOutline, swapHorizontalOutline });
    }

    ngOnInit() {
        if (this.account.dateecheance != null && (new Date(this.account.dateecheance) < (new Date()))) {
            this.loans_expired = true;
        }
        if (this.account.sfdateecheance != null && (new Date(this.account.sfdateecheance) < (new Date()))) {
            this.sfloans_expired = true;
        }
    }

    dismiss() {
        this.modalCtrl.dismiss();
    }
}
