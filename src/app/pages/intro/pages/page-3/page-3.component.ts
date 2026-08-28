import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonItem, IonLabel, IonText } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { addIcons } from "ionicons";
import { chevronForwardOutline } from "ionicons/icons";

@Component({
    selector: 'app-page-3',
    templateUrl: './page-3.component.html',
    styleUrls: ['./page-3.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports:[
      IonText,
      IonItem,
      IonLabel,
      TranslatePipe
    ]
})
export class Page3Component implements OnInit {

    constructor() {
        addIcons({ chevronForwardOutline });
    }

    ngOnInit() { }

}
