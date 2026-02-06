import { Component, OnInit, ɵDEFAULT_LOCALE_ID } from '@angular/core';
import { DataProvider, Meeting } from '../../providers/provider-data';
import { NavController } from '@ionic/angular';
import { formatDate } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { format, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { TranslateService } from '@ngx-translate/core';
import { MeetingFormComponent } from '../../component/meeting-form/meeting-form.component';
import { AlertController } from '@ionic/angular';
import { GroupTools } from '../../providers/group-tools';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-meeting',
  templateUrl: './new-meeting.page.html',
  styleUrls: ['./new-meeting.page.scss'],
  standalone: false
})
export class NewMeetingPage implements OnInit {
  country: any = null;
  group: any = null;
  meetings: any = []
  startedat: any = null;
  place = "";

  constructor(
    private dataProvider: DataProvider,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private alertCtrl: AlertController,
    private groupTools: GroupTools,
    private router: Router
  ) { }

  ngOnInit() {
    this.load_currents();
    this.startedat = formatDate(new Date(), 'Y-MM-dd', ɵDEFAULT_LOCALE_ID);
  }

  ionViewWillEnter(){

  }

  async load_currents(){
    var current = await this.dataProvider.getCurrent();
    if(!current || current.country == undefined){
      this.navCtrl.navigateForward('/countries');
    }else if(!current.group){
      this.navCtrl.navigateForward('/country/' + current.country.id + '/groups');
    }else {
      this.country = current.country;
      this.group = current.group;
      this.meetings = await this.groupTools.get_meetings(this.group);
    }
  }

  async openDate(){
    const modal = await this.modalCtrl.create({
        component: MeetingFormComponent,
        componentProps: {place: this.place },
        initialBreakpoint: 0.3,
        breakpoints: [0, 0.3, 0.5],
        handle: true,
        cssClass: 'lang-modal-sheet'
      });
      await modal.present();

      this.place = (await modal.onWillDismiss()).data as string;
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
      this.dataProvider.newMeeting(this.group.id, this.place, date).then((data: any)=>{
        if(data.meeting){
          this.dataProvider.current.meeting = data.meeting;
          //this.navCtrl.navigateForward('/meeting-details/');
          this.router.navigate(['/meeting-details'], {state: {direction: 'forward'}}); return;
        }
        return;
      });
    }
  }

}
