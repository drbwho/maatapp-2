import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { OperationTools } from '../../../../providers/operation-tools';
import { addIcons } from "ionicons";
import { addCircle, removeCircle } from "ionicons/icons";
import { IonCard, IonGrid, IonRow, IonCol, IonIcon, IonButton, IonList, IonItem, IonLabel, IonAvatar, IonNote } from '@ionic/angular';
import { CommonModule, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AutofitTextDirective } from '../../../../directives/auto-fit-text.directive';

@Component({
    selector: 'app-settlement',
    templateUrl: './settlement.component.html',
    styleUrls: ['./settlement.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        DecimalPipe,
        IonCard,
        IonGrid,
        IonRow,
        IonCol,
        IonIcon,
        IonList,
        IonItem,
        IonLabel,
        AutofitTextDirective
    ]
})
export class SettlementComponent implements OnInit {
    @Input() group: any;
    @Input() accounts: any;
    @Input() country: any;
    @Input() meeting: any;
    attendance = 0;
    numberofmembers = 0;

    constructor(
        private operTools: OperationTools
    ) {
        addIcons({ addCircle, removeCircle });
    }

    ngOnInit() {
        this.numberofmembers = this.group.numberofmembers;
        this.accounts = this.accounts.filter(m => m.isPresent);
        this.attendance = this.accounts.length;
        this.accounts.forEach(async acc => {
            acc.show_details = false;
            await this.operTools.estimate_meeting_totals(acc, this.meeting.id).then(data => {
                acc.totals = data;
            });
        });
        this.operTools.estimate_meeting_totals(this.group.account, this.meeting.id).then(data => {
            this.meeting.totals = data;
        })
    }


}
