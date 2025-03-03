import { DataProvider } from '../../providers/provider-data';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'about',
    templateUrl: './about.page.html',
    styleUrls: ['./about.page.scss'],
    standalone: false
})

export class AboutPage implements OnInit {
  confdata =
    {
    'title': '',
    'body': '',
    'venue': '',
    'datefrom': '',
    'dateto': ''
    };

  constructor(public dataProvider: DataProvider) { }

  ngOnInit() {
  }

}
