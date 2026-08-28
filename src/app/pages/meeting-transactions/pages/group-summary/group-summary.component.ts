import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { IonGrid, IonRow, IonCol, IonCard, IonButton } from '@ionic/angular/standalone';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AutofitTextDirective } from '../../../../directives/auto-fit-text.directive';

@Component({
    selector: 'app-group-summary',
    templateUrl: './group-summary.component.html',
    styleUrls: ['./group-summary.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        DecimalPipe,
        IonGrid,
        IonRow,
        IonCol,
        IonCard,
        IonButton,
        AutofitTextDirective
    ]
})
export class GroupSummaryComponent implements OnInit {
    @Input() group: any;
    @Input() accounts: any;
    duetoday = 0;
    pending = 0;
    completing = 0;
    show_details = false;

    constructor() { }

    ngOnInit() {
        const todayStr = new Date().toDateString();
        this.duetoday = this.accounts.filter((s) => { s.dateecheance && new Date(s.dateecheance).toDateString() === todayStr }).length;
        this.pending = this.accounts.filter((s) => s.due > 0).length;
        this.completing = this.accounts.filter((s) => s.emprunts > 0).length - this.group.numloans;
    }

}
