import { Component, OnInit } from '@angular/core';
import { DataProvider } from '../../providers/provider-data';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.page.html',
  styleUrls: ['./countries.page.scss'],
})
export class CountriesPage implements OnInit {
  countries: any;

  constructor(private dataProvider: DataProvider) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.dataProvider.fetch_data('countries', null, false, true).then((data: any)=> {this.countries = data;});
  }

}
