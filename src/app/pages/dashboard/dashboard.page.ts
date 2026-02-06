import { Component, OnInit } from '@angular/core';
import { DataProvider, Meeting } from '../../providers/provider-data';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { GroupTools } from '../../providers/group-tools';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  group: any = null;
  country: any = null;
  meetings: any = {};
  lastmeeting: any = {};
  account: any = {};
  meeting_status = "";
  upload_status = false;
  network_status = false;

  constructor(
    private dataProvider: DataProvider,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private groupTools: GroupTools
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
      this.meetings = await this.groupTools.get_meetings(this.group)
      this.account = current.group.totals;
      this.lastmeeting = this.groupTools.get_last_meeting(this.meetings);
      this.meeting_status = await this.groupTools.get_meeting_status(this.meetings, this.group);
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
