import { Component, OnInit } from '@angular/core';
import { DataProvider } from '../../providers/provider-data';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { TransactionsComponent } from '../../component/transactions/transactions.component';
import { Events } from '../../providers/events';

@Component({
  selector: 'app-meeting-details',
  templateUrl: './meeting-details.page.html',
  styleUrls: ['./meeting-details.page.scss'],
})
export class MeetingDetailsPage implements OnInit {
  meetingplace: string;
  meetingdate: string;
  groupname: string;
  currency: string;
  group: any;
  meeting: any;
  accounts: any;

  constructor(
    private dataProvider: DataProvider,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private events: Events
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    const meetingId = this.route.snapshot.paramMap.get('meetingId');
    this.meeting = this.dataProvider.current.meeting;
    this.meetingplace = this.meeting.place;
    this.meetingdate = this.meeting.startedat;
    this.group = this.dataProvider.current.group;
    this.groupname = this.group.name;
    this.currency = this.dataProvider.current.country.currency;

    this.load_accounts();
  }

  load_accounts(){
    this.dataProvider.fetch_from_api('accounts', this.group.id, true).then((data: any)=> {
      this.accounts = data.filter((s)=> s.type == 1 && s.statut == 0); //paysant comptes
    });
  }

  async presentModal(event: Event, account: any) {
    const modal = await this.modalCtrl.create({
      component: TransactionsComponent,
      componentProps: {account: account}
    });
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) {
      // refresh accounts totals
      this.load_accounts();
    }
  }

}
