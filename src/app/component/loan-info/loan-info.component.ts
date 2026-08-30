import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ModalController, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonInput } from '@ionic/angular';
import { addIcons } from "ionicons";
import { chevronBackOutline } from "ionicons/icons";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-loan-info',
    templateUrl: './loan-info.component.html',
    styleUrls: ['./loan-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslatePipe,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonButton,
        IonIcon,
        IonContent,
        IonInput
    ]
})
export class LoanInfoComponent implements OnInit {
    @Input() account: any;
    @Input() country: any;
    @Input() loan_info?: any = {};
    notes: string;
    amount: number;
    public pf = parseFloat;

    constructor(private modalCtrl: ModalController) {
        addIcons({ chevronBackOutline });
    }

    ngOnInit() { }

    ionViewWillEnter() {
        if (this.loan_info) {
            if (this.loan_info.notes) {
                this.notes = this.loan_info.notes;
            }
            if (this.loan_info.amount) {
                this.amount = this.loan_info?.amount;
            }
        }
    }

    dismiss(save = false) {
        if (save) {
            this.loan_info.notes = this.notes;
            this.loan_info.amount = this.amount;
            this.modalCtrl.dismiss(this.loan_info);
        } else {
            this.modalCtrl.dismiss();
        }
    }
}
