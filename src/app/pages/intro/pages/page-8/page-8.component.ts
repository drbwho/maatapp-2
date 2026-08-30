import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonText } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-page-8',
    templateUrl: './page-8.component.html',
    styleUrls: ['./page-8.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports:[
      IonText,
      TranslatePipe
    ]
})
export class Page8Component implements OnInit {

    constructor() { }

    ngOnInit() { }

}

