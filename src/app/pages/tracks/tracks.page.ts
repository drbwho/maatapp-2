import { ConferenceData } from './../../providers/conference-data';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'tracks',
  templateUrl: './tracks.page.html',
  styleUrls: ['./tracks.page.scss'],
})
export class TracksPage implements OnInit {
  tracks: any;

  constructor(public dataProvider: ConferenceData) {}

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.dataProvider.load().subscribe((data: any) => {
      if (data && data.eventdates) {
          this.tracks = data.tracks;
        }
      });
  }
}
