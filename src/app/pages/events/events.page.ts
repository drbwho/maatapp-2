import { ConferenceData } from './../../providers/conference-data';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit {
  events: any;

  constructor(public dataProvider: ConferenceData) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.dataProvider.load().subscribe((data: any) => {
      if (data && data.socialevents) {
          this.events = data.socialevents;
        }
      });
  }
}
