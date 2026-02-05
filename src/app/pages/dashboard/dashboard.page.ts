import { Component, OnInit } from '@angular/core';
import { DataProvider } from '../../providers/provider-data';
import { NavController } from '@ionic/angular';
import { Events } from '../../providers/events';
import { ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  group = {id:"", name:"", ville:""}
  country = {id:"", name:"", currency:"", flagcode:"gb"};
  lastmeeting: any = {};
  account: any = {};
  meeting_status = "";
  upload_status = false;
  network_status = false;

  constructor(
    private dataProvider: DataProvider,
    private navCtrl: NavController,
    private events: Events,
    private route: ActivatedRoute,
    private storage: Storage,
    private config: ConfigData,
    private appcomponent: AppComponent
  ) {
    this.route.url.subscribe(() => {
      this.load_currents(); // Hack to refresh page in every visit!
    });
  }

  ngOnInit() { }

  ionViewWillEnter(){
    this.load_currents();
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
      this.lastmeeting = current.group.lastmeeting;
      this.account = current.group.totals;
      this.set_meeting_status();
    }
  }

  navToGroups(){
    var curcountry = this.dataProvider.current.country;
    if(!curcountry || !curcountry.id){
      this.navCtrl.navigateForward('/countries');
    }else{
      this.navCtrl.navigateForward('/country/' + curcountry.id + '/groups');
    }
  }

  async set_meeting_status(){
    this.network_status = this.appcomponent.networkStatus;
    this.upload_status = await this.check_upload_status();
    if(!this.lastmeeting){
      this.meeting_status = "no-meetings";
    }else if(!this.lastmeeting.endedat && !this.upload_status){
      this.meeting_status = "in-progress";
    }else if(this.lastmeeting.endedat && !this.upload_status){
      this.meeting_status = "no-active";
    }else if(!this.lastmeeting.endedat && this.upload_status && this.network_status){
      this.meeting_status = "saved-local";
    }else if(!this.lastmeeting.endedat && this.upload_status && !this.network_status){
      this.meeting_status = "saved-offline";
    }
  }

  async check_upload_status (){
    var res = await this.storage.get(this.config.TRANSACTIONS_FILE);
    var newmeetings = await this.storage.get(this.config.NEWMEETINS_FILE);
    if((res && res.length) || newmeetings && newmeetings.length){
      return true;
    }
    return false;
  }

}
