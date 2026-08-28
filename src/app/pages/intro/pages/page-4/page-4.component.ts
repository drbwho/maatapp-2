import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonItem, IonLabel, IonText } from "@ionic/angular/standalone";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-page-4',
    templateUrl: './page-4.component.html',
    styleUrls: ['./page-4.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports:[
      IonText,
      IonItem,
      IonLabel,
      TranslatePipe
    ]
})
export class Page4Component implements OnInit {

    constructor() { }

    ngOnInit() { }

}
