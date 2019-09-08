import { Events } from '@ionic/angular';
import { ConferenceData } from './../../providers/conference-data';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {
  info: any;
  infotitle: any;
  pagetitle: any;

  constructor(
    public dataProvider: ConferenceData,
    private route: ActivatedRoute,
    private events: Events
    ) {}

  ngOnInit() {
    this.events.subscribe('info:updated', (newPage) => {
      // do something when updated data
      this.updateData(newPage);
    });
  }

  ionViewWillEnter() {
    const infotype = this.route.snapshot.paramMap.get('infoType');
    this.updateData(infotype);
  }

  updateData (infotype: any) {
    // const infotype = this.route.snapshot.paramMap.get('infoType');
    this.dataProvider.load().subscribe((data: any) => {
      if (data && data.eventdates) {
          switch (infotype) {
            case 'actionpositions':
              this.infotitle = 'Action Leaders';
              this.info = data.info[0].actionpositions;
              break;
            case 'organiser':
              this.infotitle = 'Local Organiser';
              this.info = data.info[0].organiser;
              break;
            case 'accomodation':
              this.infotitle = 'Hotel Info';
              this.info = data.info[0].accomodation;
              break;
          }
        }
      });
  }

}
