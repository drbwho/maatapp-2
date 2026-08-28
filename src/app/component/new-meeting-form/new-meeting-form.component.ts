import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ModalController, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, IonList, IonItem, IonInput } from '@ionic/angular/standalone';
import { addIcons } from "ionicons";
import { chevronBackOutline } from "ionicons/icons";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-new-meeting-form',
    templateUrl: './new-meeting-form.component.html',
    styleUrls: ['./new-meeting-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslatePipe,
        IonHeader,
        IonToolbar,
        IonTitle,
        IonButtons,
        IonButton,
        IonIcon,
        IonContent,
        IonList,
        IonItem,
        IonInput
    ]
})
export class NewMeetingFormComponent implements OnInit {
    @Input() place: any;

    constructor(
        private modalCtrl: ModalController,
    ) {
        addIcons({ chevronBackOutline });
    }

    ngOnInit() { }

    dismiss() {
        this.modalCtrl.dismiss();
    }

    onPlaceChange(ev) {
        //remove numbers from place
        //const val: string = ev.detail?.value ?? '';
        //this.place = val.replace(/[0-9]/g, '');
        //ev.target.value = this.place;
    }

    //showSelectDateFrom(){
    //  this.datefromModal.present();
    // }

    //clearDate(){
    //  this.startedat = "";
    //}

    //formatDate(date: string){
    //  const local: Locale = enUS;
    //  return format(parseISO(date), 'd MMM yyyy',{locale: local});
    // }

    valider() {
        this.modalCtrl.dismiss(this.place);
    }
}


