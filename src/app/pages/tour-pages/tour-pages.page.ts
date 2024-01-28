import { ConferenceData } from './../../providers/conference-data';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tour-pages',
  templateUrl: './tour-pages.page.html',
  styleUrls: ['./tour-pages.page.scss'],
})
export class TourPagesPage implements OnInit {
  tourpages: any;

  constructor(public dataProvider: ConferenceData) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.dataProvider.load().subscribe((data: any) => {
      if (data && data.infopages) {
          this.tourpages = data.infopages.filter( d => d.category == 'tour');
        }
      });
  }
}
