import { ConferenceData } from './../../providers/conference-data';
import { Component, OnInit } from '@angular/core';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';

@Component({
  selector: 'rooms',
  templateUrl: './rooms.page.html',
  styleUrls: ['./rooms.page.scss'],
})
export class RoomsPage implements OnInit {
  rooms: any;
  venue: any;
  lat: any;
  lng: any;

  constructor(public dataProvider: ConferenceData, private photoViewer: PhotoViewer) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.dataProvider.load().subscribe((data: any) => {
      if (data && data.eventdates) {
          this.rooms = data.rooms;
          this.venue = data.info[0].venue;
          this.lat = data.info[0].lat;
          this.lng = data.info[0].lng;
        }
      });
  }

  photoView (url: string) {
    this.photoViewer.show(url, 'Room Plan');
  }
}
