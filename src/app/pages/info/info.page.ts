import { ConferenceData } from './../../providers/conference-data';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events } from '../../providers/events';

@Component({
  selector: 'info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {
  info: any;
  infotitle: any;
  pagetitle: any;
  defaultHref = '';
  infoimage = '';

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
    this.dataProvider.load().subscribe((data: any) => {
      if (data && data.infopages) {
          switch (infotype) {
            case 'actionpositions':
              this.infotitle = 'Action Leaders';
              break;
            case 'mcmembers':
                this.infotitle = 'MC Members';
                break;
            case 'organiser':
              this.infotitle = 'Organiser';
              this.infoimage = 'assets/img/organiser.png';
              break;
            case 'accomodation':
              this.infotitle = 'Hotels';
              break;
            case 'eventphotos':
                this.infotitle = 'Event Photos / Videos';
                break;
            case 'bookofabstracts':
                this.infotitle = 'Book of Abstracts / Slides';
                this.infoimage = 'assets/img/abstracts.png';
                break;
            default :
              if ( infotype.indexOf('info - ') > -1) {
                this.infotitle = infotype.replace('info - ', '');
                this.defaultHref = '/app/tabs/infopages';
              } else {
                this.infotitle = infotype.replace('tour - ', '');
                this.defaultHref = '/app/tabs/tourpages';
              }
          }
          this.info = data.infopages.find( d => d.title === infotype ).body;
        }
      });
  }

}
