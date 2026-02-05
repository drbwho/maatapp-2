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
  group: any = null;
  country: any = null;
  lastmeeting: any = {};
  account: any = {};
  meeting_status = "";
  upload_status = false;
  network_status = false;

  constructor(
    private dataProvider: DataProvider,
    private navCtrl: NavController,
    private route: ActivatedRoute,
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
      this.meeting_status = await this.appcomponent.get_meeting_status(this.lastmeeting);
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

}
