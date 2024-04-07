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
    /*this.dataProvider.load().subscribe((data: any) => {
      if (data && data.countries) {
          this.countries = data.countries;
        }
      });*/
      this.dataProvider.fetch_from_api('countries').then((data: any)=> {this.countries = data;});
  }

}
