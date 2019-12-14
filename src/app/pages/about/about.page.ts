import { ConferenceData } from './../../providers/conference-data';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'about',
  templateUrl: './about.page.html',
  styleUrls: ['./about.page.scss'],
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

  constructor(public dataProvider: ConferenceData) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.dataProvider.load().subscribe((data: any) => {
      if (data && data.socialevents) {
          this.confdata.title = data.info[0].title;
          this.confdata.venue = data.info[0].venue;
          this.confdata.body = data.info[0].body;
          this.confdata.datefrom = data.eventdates[0].date;
          this.confdata.dateto = data.eventdates[data.eventdates.length - 1].date;
        }
      });
  }

}
