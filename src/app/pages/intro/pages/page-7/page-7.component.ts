import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonItem, IonLabel, IonText } from "@ionic/angular/standalone";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-page-7',
    templateUrl: './page-7.component.html',
    styleUrls: ['./page-7.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports:[
      IonText,
      IonItem,
      IonLabel,
      TranslatePipe
    ]
})
export class Page7Component implements OnInit {

    constructor() { }

    ngOnInit() { }

}
