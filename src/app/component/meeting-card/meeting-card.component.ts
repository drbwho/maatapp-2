import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonItem, IonGrid, IonRow, IonCol, IonIcon } from '@ionic/angular';
import { addIcons } from "ionicons";
import { chevronForwardOutline } from "ionicons/icons";
import { CommonModule, DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-meeting-card',
    templateUrl: './meeting-card.component.html',
    styleUrls: ['./meeting-card.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        DatePipe,
        IonItem,
        IonGrid,
        IonRow,
        IonCol,
        IonIcon
    ]
})
export class MeetingCardComponent implements OnInit {
    @Input() attendance: string = '';
    @Input() group?: any = null;
    @Input() meeting?: any = null;

    constructor(
    ) {
        addIcons({ chevronForwardOutline });
    }

    ngOnInit() {
    }

    status() {
        if (this.meeting.endedat) {
            return 'closed' + ((this.meeting.haspending || this.meeting.pending) ? '-pending' : '');
        }
        return 'progress' + ((this.meeting.haspending || this.meeting.pending) ? '-pending' : '');
    }

    fullDate() {
        return this.meeting?.endedat ? this.meeting?.endedat : this.meeting?.startedat;
    }
}

