import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataProvider } from '../../providers/provider-data';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
  group = {id:"", name:"", ville:""}
  country = {id:"", name:""};

  constructor(
    private router: Router,
    private dataProvider: DataProvider
  ) { }

  ngOnInit() {}


  async ionViewWillEnter(){
    var current = await this.dataProvider.getCurrent();
    if(!current || current.country == undefined){
      this.router.navigate(['/app/tabs/countries'], {state: {}});
    }else if(!current.group){
      this.router.navigate(['/app/tabs/country/' + current.country.id + '/groups'], {state: {}});
    }else {
      this.country = current.country;
      this.group = current.group;
    }
  }

  navToGroups(){
    var curcountry = this.dataProvider.current.country;
    if(!curcountry){
      this.router.navigate(['/app/tabs/countries'], {state: {}});
    }
    this.router.navigate(['/app/tabs/country/' + curcountry.id + '/groups'], {state: {}});
  }

}
