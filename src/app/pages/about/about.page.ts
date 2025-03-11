import { TranslateService } from '@ngx-translate/core';
import { DataProvider } from '../../providers/provider-data';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'about',
    templateUrl: './about.page.html',
    styleUrls: ['./about.page.scss'],
    standalone: false
})

export class AboutPage implements OnInit {
  curLang: string;
  confdata =
    {
    'title': '',
    'body': '',
    'venue': '',
    'datefrom': '',
    'dateto': ''
    };

  constructor(public dataProvider: DataProvider, private translate: TranslateService) { }

  ngOnInit() {}

  ionViewWillEnter() {
    this.curLang = this.translate.currentLang;
  }

}
