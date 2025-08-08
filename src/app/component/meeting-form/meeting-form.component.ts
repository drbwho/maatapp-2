import { Component, Input, OnInit, ViewChild, ɵDEFAULT_LOCALE_ID } from '@angular/core';
import { AlertController, IonModal, ModalController } from '@ionic/angular';
import { format, Locale, parseISO } from 'date-fns';
import { formatDate } from '@angular/common';
import { el, enUS } from 'date-fns/locale';
import { DataProvider } from '../../providers/provider-data';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-meeting-form',
    templateUrl: './meeting-form.component.html',
    styleUrls: ['./meeting-form.component.scss'],
    standalone: false
})
export class MeetingFormComponent  implements OnInit {
  @Input() group: any;
  @Input() meetings: any;
  @ViewChild('dateFromModal') datefromModal: IonModal;

  place: any;
  startedat: string;
  pickerMinDate: string;

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private dataProvider: DataProvider,
    private translate: TranslateService
  ) { }

  ngOnInit() {
     // min date = now for date pickers
     this.pickerMinDate = formatDate(new Date(), 'Y-MM-dd', ɵDEFAULT_LOCALE_ID);
     this.startedat = formatDate(new Date(), 'Y-MM-dd', ɵDEFAULT_LOCALE_ID);
  }

  dismiss(){
    this.modalCtrl.dismiss();
  }

  onPlaceChange(ev) {
    const val: string = ev.detail?.value ?? '';
    this.place = val.replace(/[0-9]/g, '');
    ev.target.value = this.place;
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
    this.translate.get(['confirmation','are_you_sure','no','yes']).subscribe(async (keys: any)=>{
      const alert = await this.alertCtrl.create({
        header: keys['confirmation'],
        message: keys['are_you_sure'],
        buttons: [
        {
          text: keys['no'],
        },
        {
          text: keys['yes'],
          handler: () => {
            this.submit_meeting();
          },
        },
        ],
      });
      await alert.present();
    });
  }

  async submit_meeting(){
    let date = format(parseISO(this.startedat), 'yyyy-MM-dd',{locale: enUS});

    // Check if meeting exists the same date
    let day_exists = false;
    this.meetings.forEach(async (m)=>{
      if(m.startedat == date && !m.cancelled){
        day_exists = true;
      }
    })

    if(this.place == undefined || !this.place.trim()){
      this.translate.get(['error','place_cannot_be_empty']).subscribe(async (keys: any)=>{
        const alert = await this.alertCtrl.create({
          header: keys['error'],
          message: keys['place_cannot_be_empty']+'!',
          buttons: [
          {
            text: 'Ok',
          },
          ],
        });
        await alert.present();
      });
      return;
    }

    if(day_exists){
      this.translate.get(['error','there_is_already_a_meeting']).subscribe(async (keys: any)=>{
        const alert = await this.alertCtrl.create({
          header: keys['error'],
          message: keys['there_is_already_a_meeting'],
          buttons: [
          {
            text: 'Ok',
          },
          ],
        });
        await alert.present();
      });
    }else{
      this.dataProvider.newMeeting(this.group.id, this.place, date).then(()=>{
        this.modalCtrl.dismiss(true);
      });
    }
  }
}


