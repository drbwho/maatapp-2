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
  infobody: any;
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
      this.updateData(newPage, null);
    });
  }

  ionViewWillEnter() {
    const infotype = this.route.snapshot.paramMap.get('infoType');
    const page = this.route.snapshot.paramMap.get('page');
    this.updateData(infotype, page);
  }

  updateData (infotype: any, page: any) {
    this.dataProvider.load().subscribe((data: any) => {
      if (data && data.infopages) {
          this.info = data.infopages.filter( d => d.category === infotype );        
          //if specific page given
          if(page){
            this.info = this.info.find( d => d.title === page);
          }else{
            //in case of multiple results...should be avoided in special categories
            this.info = this.info[0];
          }
          this.infobody = this.info.body;
          switch (this.info.category) {
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
              this.infotitle = 'Hotel Info';
              break;
            case 'eventphotos':
                this.infotitle = 'Event Photos / Videos';
                break;
            case 'bookofabstracts':
                this.infotitle = 'Book of Abstracts / Slides';
                this.infoimage = 'assets/img/abstracts.png';
                break;
           case 'info': 
                this.infotitle = this.info.title;
                this.defaultHref = '/app/tabs/infopages';
                break;
           case 'tour':
                this.infotitle = this.info.title;
                this.defaultHref = '/app/tabs/tourpages';
                break;
           default:
                this.infotitle = '';
          }         
        }
      });
  }
}
