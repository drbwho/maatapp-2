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

  constructor(
    private dataProvider: DataProvider,
    private router: Router
    ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.dataProvider.fetch_data('countries', null, false, true).then((data: any)=> {this.countries = data;});
  }

  async navto(country){
    // Set current Country
    var current = await this.dataProvider.getCurrent();
    current.country = country;
    current.group = null;
    this.dataProvider.setCurrent(current);
    this.router.navigate(['/app/tabs/country/'+ country.id+'/groups'], {state: {}});
  }

}
