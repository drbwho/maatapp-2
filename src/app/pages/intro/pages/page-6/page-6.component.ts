import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { addIcons } from "ionicons";
import { chevronForwardOutline } from "ionicons/icons";
import { IonItem, IonIcon, IonText, IonLabel, IonList, IonButton } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-page-6',
    templateUrl: './page-6.component.html',
    styleUrls: ['./page-6.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports:[
      IonText,
      IonItem,
      IonLabel,
      IonButton,
      IonIcon,
      TranslatePipe
    ]
})
export class Page6Component implements OnInit {

    constructor() {
        addIcons({ chevronForwardOutline });
    }

    ngOnInit() { }

}
