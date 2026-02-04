import { Component, OnInit } from '@angular/core';
import { DataProvider } from '../../providers/provider-data';
import { Router } from '@angular/router';

@Component({
    selector: 'app-countries',
    templateUrl: './countries.page.html',
    styleUrls: ['./countries.page.scss'],
    standalone: false
})
export class CountriesPage implements OnInit {
  countries: any;
  currentid = 0;

  constructor(
    private dataProvider: DataProvider,
    private router: Router
    ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    this.dataProvider.fetch_data('countries', null, false, true).then((data: any)=> {this.countries = data;});
    var current = await this.dataProvider.getCurrent();
    if(current && current.country){
      this.currentid = current.country.id;
    }
  }

  async navto(country){
    // Set current Country
    var current = await this.dataProvider.getCurrent();
    current.country = country;
    current.group = null;
    this.dataProvider.setCurrent(current);
    this.router.navigate(['/country/'+ country.id+'/groups'], {state: {direction: 'forward'}});
  }

}
