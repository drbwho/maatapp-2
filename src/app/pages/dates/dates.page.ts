import { ConferenceData } from './../../providers/conference-data';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'dates',
  templateUrl: './dates.page.html',
  styleUrls: ['./dates.page.scss'],
})
export class DatesPage implements OnInit {
  dates: any;

  constructor(private dataProvider: ConferenceData) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.dataProvider.load().subscribe((data: any) => {
      if (data && data.eventdates) {
          this.dates = data.eventdates;
        }
      });
  }
}
