import { Component, Input, OnInit, ViewChild, ɵDEFAULT_LOCALE_ID } from '@angular/core';
import { IonModal, ModalController } from '@ionic/angular';
import { format, Locale, parseISO } from 'date-fns';
import { formatDate } from '@angular/common';
import { el, enUS } from 'date-fns/locale';

@Component({
  selector: 'app-meeting-form',
  templateUrl: './meeting-form.component.html',
  styleUrls: ['./meeting-form.component.scss'],
})
export class MeetingFormComponent  implements OnInit {
  @Input() group: any;
  @ViewChild('dateFromModal') datefromModal: IonModal;

  place: any;
  startedat: string;
  pickerMaxDate: string;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
     // max date = now for date pickers
     this.pickerMaxDate = formatDate(new Date(), 'Y-MM-dd', ɵDEFAULT_LOCALE_ID);
  }

  dismiss(){
    this.modalCtrl.dismiss();
  }

  showSelectDateFrom(){
    this.datefromModal.present();
  }

  clearDate(){
    this.startedat = "";
  }

  formatDate(date: string){   
    const local: Locale = enUS;
    return format(parseISO(date), 'd MMM yyyy',{locale: local});
  }
}


