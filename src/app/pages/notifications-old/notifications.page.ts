import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonRow, IonCol, IonButton } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'notifications',
    templateUrl: './notifications.page.html',
    styleUrls: ['./notifications.page.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        IonHeader,
        IonToolbar,
        IonButtons,
        IonMenuButton,
        IonTitle,
        IonContent,
        IonCard,
        IonCardHeader,
        IonCardTitle,
        IonCardContent,
        IonRow,
        IonCol,
        IonButton
    ]
})
export class NotificationsPage {
    message: any;

    constructor(private route: ActivatedRoute) {
        this.getParams();
    }

    async getParams() {
        this.message = JSON.parse(this.route.snapshot.paramMap.get('data'));
    }

}
