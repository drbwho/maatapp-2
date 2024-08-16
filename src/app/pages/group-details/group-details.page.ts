import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataProvider } from '../../providers/provider-data';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';
import { ModalController } from '@ionic/angular';
import { AccountInfoComponent } from '../../component/account-info/account-info.component';
import { GroupDetailsPageRoutingModule } from './group-details-routing.module';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.page.html',
  styleUrls: ['./group-details.page.scss'],
})
export class GroupDetailsPage implements OnInit {
  segment = "reunions";
  groupname: string;
  countryname: string;
  currency: string;
  group: any;
  meetings: any;
  accounts: any;
  allmeetings: any;
  allaccounts: any;
  queryText: string;

  constructor(
    private dataProvider: DataProvider,
    private route: ActivatedRoute,
    private router: Router,
    private storage: Storage,
    private config: ConfigData,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    const groupId = this.route.snapshot.paramMap.get('groupId');

    this.group = this.dataProvider.current.group;
    this.groupname = this.dataProvider.current.group.name;
    this.countryname = this.dataProvider.current.country.name;
    this.currency = this.dataProvider.current.country.currency;

    this.dataProvider.fetch_data('meetings', groupId, true).then((data: any)=> {
      this.meetings = data;
      this.allmeetings = data;
      //check if meeting has pending transactions to upload
      this.meetings.forEach((m)=>{
        m.haspending = false;
        this.storage.get(this.config.TRANSACTIONS_FILE).then((trns)=>{
          if(trns && (trns.filter(s => s.meetingid == m.id)).length){
            m.haspending = true;
          }
        });
      })
    });
    this.dataProvider.fetch_data('accounts', groupId, true).then((data: any)=> {
      this.accounts = data;
      this.allaccounts = data;
    });
  }

  navto(meeting: any){
    this.dataProvider.current.meeting = meeting;
    this.router.navigate(['/app/tabs/meetings/'+ meeting.id], {state: {}});
  }

  searcher(){
    if(this.segment == 'reunions'){
      this.search_meetings();
    }else{
      this.search_accounts();
    }
  }

  search_meetings(){
    if(this.queryText == ''){
        this.meetings = this.allmeetings;
      return;
    }

    let queryText = this.queryText.toLowerCase().replace(/,|\.|-/g, ' ');
    const queryWords = queryText.split(' ').filter(w => !!w.trim().length);

    this.meetings = [];
    this.allmeetings.forEach((gr: any) => {
      if (queryWords.length) {
        queryWords.forEach((queryWord: string) => {
          if (gr.place.toLowerCase().indexOf(queryWord) > -1) {
            this.meetings.push(gr);
          }
        });
      }
    });
  }

  search_accounts(){
    if(this.queryText == ''){
        this.accounts = this.allaccounts;
      return;
    }

    let queryText = this.queryText.toLowerCase().replace(/,|\.|-/g, ' ');
    const queryWords = queryText.split(' ').filter(w => !!w.trim().length);

    this.accounts = [];
    this.allaccounts.forEach((gr: any) => {
      if (queryWords.length) {
        queryWords.forEach((queryWord: string) => {
          if (gr.owner.toLowerCase().indexOf(queryWord) > -1) {
            this.accounts.push(gr);
          }
        });
      }
    });
  }

  async showAccountInfo(account){
    const modal = await this.modalCtrl.create({
      component: AccountInfoComponent,
      componentProps: {'account': account, 'currency': this.currency}
    });
    modal.present();

    await modal.onWillDismiss();
  }
}
