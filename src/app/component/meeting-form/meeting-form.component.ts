import { Component, Input, OnInit, ViewChild, ɵDEFAULT_LOCALE_ID } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-meeting-form',
    templateUrl: './meeting-form.component.html',
    styleUrls: ['./meeting-form.component.scss'],
    standalone: false
})
export class MeetingFormComponent  implements OnInit {
  @Input() place: any;

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {}

  dismiss(){
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

  valider(){
    this.modalCtrl.dismiss(this.place);
  }
}


