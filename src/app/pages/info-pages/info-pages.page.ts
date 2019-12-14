import { ConferenceData } from './../../providers/conference-data';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'info-pages',
  templateUrl: './info-pages.page.html',
  styleUrls: ['./info-pages.page.scss'],
})
export class InfoPagesPage implements OnInit {
  infopages: any;

  constructor(public dataProvider: ConferenceData) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.dataProvider.load().subscribe((data: any) => {
      if (data && data.infopages) {
          this.infopages = data.infopages.filter( d => d.title.indexOf('info') > -1);
        }
      });
  }
}
