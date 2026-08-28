import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonItem, IonLabel, IonList, IonText } from "@ionic/angular/standalone";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-page-5',
    templateUrl: './page-5.component.html',
    styleUrls: ['./page-5.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports:[
      IonText,
      IonItem,
      IonList,
      IonLabel,
      TranslatePipe
    ]
})
export class Page5Component implements OnInit {

    constructor() { }

    ngOnInit() { }

}
