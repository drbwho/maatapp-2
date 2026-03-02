import { Component, OnInit } from '@angular/core';
import { DataProvider, Meeting } from '../../providers/provider-data';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { GroupTools } from '../../providers/group-tools';
import { OperationTools } from '../../providers/operation-tools';
import { UserData } from '../../providers/user-data';


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
  last_attendance = 0;
  totals: any = {};
  meeting_status = "";
  upload_status = false;
  network_status = false;
  num_ECP = 0;
  collected = 0;

  constructor(
    private dataProvider: DataProvider,
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private userData: UserData,
    private groupTools: GroupTools,
    private operationTools: OperationTools
  ) {}

  ngOnInit() {
    this.route.url.subscribe(() => {
      this.load_currents(); // Hack to force refreshing page in every visit!
    });

    // disable introduction
    this.userData.shownIntro(true);
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
      this.totals = current.group.totals;
      this.meeting_status = await this.groupTools.get_meeting_status(this.meetings, this.group.id);
      this.lastmeeting = await this.groupTools.get_last_meeting(this.meetings);
      if(this.lastmeeting){
        this.last_attendance = this.lastmeeting.absences ? this.group.numberofmembers - this.lastmeeting.absences.length : 0;
        this.num_ECP = await this.operationTools.get_num_of_ECP(this.lastmeeting, this.country.id);
      }else{
        this.last_attendance = 0;
        this.num_ECP = 0;
      }
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

  async open_details(){
    this.dataProvider.current.meeting = this.lastmeeting;
    this.navCtrl.navigateForward('/meeting-transactions');
  }

}
