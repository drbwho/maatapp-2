import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ModalController, IonHeader, IonToolbar, IonContent, IonBadge, IonFooter, IonButton, IonButtons, IonIcon, IonTitle, IonBackButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

// needed fot translate pipe activation
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { chevronBackOutline } from 'ionicons/icons';

@Component({
    selector: 'app-action-view',
    templateUrl: './action-view.component.html',
    styleUrls: ['./action-view.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        IonHeader,
        IonToolbar,
        IonContent,
        IonBadge,
        IonFooter,
        IonButton,
        IonButtons,
        IonTitle,
        IonBackButton
    ]
})
export class ActionViewComponent {
    @Input() title?: string;
    @Input() alttitle?: string;
    @Input() subtitle?: string;
    @Input() image?: string;
    @Input() heading?: string;
    @Input() description?: string;
    @Input() information?: string;
    @Input() subinformation?: string;
    @Input() badge?: any;
    @Input() hasBackButton?= false;
    @Input() buttons?: any;

    constructor(
        private modalCtrl: ModalController
    ) {
      addIcons({chevronBackOutline});
    }

    click(action: string) {
        this.modalCtrl.dismiss(action);
    }
}
