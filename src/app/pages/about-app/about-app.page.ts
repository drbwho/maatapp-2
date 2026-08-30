import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'about-app',
    templateUrl: './about-app.page.html',
    styleUrls: ['./about-app.page.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        IonHeader,
        IonToolbar,
        IonButtons,
        IonMenuButton,
        IonTitle,
        IonContent
    ]
})
export class AboutAppPage implements OnInit {
    backimage: string = "";

    constructor() { }

    ngOnInit() {
        this.backimage = '/assets/img/about-bkng.png';
    }

}
