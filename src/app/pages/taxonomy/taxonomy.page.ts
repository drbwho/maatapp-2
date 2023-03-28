import { ConferenceData } from './../../providers/conference-data';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Events } from '../../providers/events';

@Component({
  selector: 'taxonomy',
  templateUrl: './taxonomy.page.html',
  styleUrls: ['./taxonomy.page.scss'],
})
export class TaxonomyPage implements OnInit {
  taxonomy: any;
  taxonomytitle: string;
  taxonomysubtitle: string;
  taxtype: string;

  constructor(
    public route: ActivatedRoute,
    public dataProvider: ConferenceData,
    public events: Events
  ) { }

  ngOnInit() {
    this.events.subscribe('taxonomy:updated', (newPage) => {
      // do something when updated data
      this.updateTaxonomy(newPage);
    });
  }

  ionViewWillEnter() {
    const taxonomyType = this.route.snapshot.paramMap.get('taxonomyType');
    this.updateTaxonomy(taxonomyType);
  }

  updateTaxonomy(taxonomyType){
    this.taxtype = taxonomyType;
    this.taxonomy = [];
    this.dataProvider.load().subscribe((data: any) => {
      if (data && data.eventdates) {
        switch (taxonomyType) {
          case 'wg':
            this.taxonomytitle = 'Working Groups';
            this.taxonomysubtitle = 'Congress Working Groups';
            this.taxonomy = data.wg;
            this.taxonomy.forEach(element => {
              element.label1 = 'Leader';
              element.line1 = element.leader;
              element.label2 = 'Vice-leader';
              element.line2 = element.subleader;
            });
            break;
          case 'capacity':
            this.taxonomytitle = 'Participants / Roles';
            this.taxonomysubtitle = 'Congress People';
            this.taxonomy = data.capacity;
            break;
        }
      }
    });
  }

}
