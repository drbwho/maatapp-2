import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonText } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-page-2',
    templateUrl: './page-2.component.html',
    styleUrls: ['./page-2.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports:[
      IonText,
      TranslatePipe
    ]
})
export class Page2Component implements OnInit {

    constructor() { }

    ngOnInit() { }

}
