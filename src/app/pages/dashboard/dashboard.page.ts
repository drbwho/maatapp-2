import { Component, OnInit } from '@angular/core';
import { DataProvider } from '../../providers/provider-data';
import { NavController } from '@ionic/angular';
import { Events } from '../../providers/events';
import { ActivatedRoute } from '@angular/router';

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

  constructor(
    private dataProvider: DataProvider,
    private navCtrl: NavController,
    private events: Events,
    private route: ActivatedRoute
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
