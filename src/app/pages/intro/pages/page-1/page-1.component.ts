import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonText } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-page-1',
    templateUrl: './page-1.component.html',
    styleUrls: ['./page-1.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports:[
      IonText,
      TranslatePipe
    ]
})
export class Page1Component implements OnInit {

    constructor() { }

    ngOnInit() { }

}
