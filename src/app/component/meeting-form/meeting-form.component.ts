import { Component, Input, OnInit, ViewChild, ɵDEFAULT_LOCALE_ID } from '@angular/core';
import { AlertController, IonModal, ModalController } from '@ionic/angular';
import { format, Locale, parseISO } from 'date-fns';
import { formatDate } from '@angular/common';
import { el, enUS } from 'date-fns/locale';
import { DataProvider } from '../../providers/provider-data';

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

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private dataProvider: DataProvider
  ) { }

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

  async valider(){
    const alert = await this.alertCtrl.create({
      header: 'Are you sure?',
      buttons: [
        {
          text: 'No',
        },
        {
          text: 'Yes',
          handler: () => {
            this.submit_meeting();
          },
        },
      ],
    });
    await alert.present();
  }

  submit_meeting(){
    this.dataProvider.newMeeting(this.group.id, this.place, this.startedat).then(()=>{
      this.modalCtrl.dismiss();
    });
  }
}


