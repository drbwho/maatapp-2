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
            this.taxonomysubtitle = 'Action Working Groups';
            this.taxonomy = JSON. parse(JSON.stringify(data.wg)); // Trick to pass object by value!
            this.taxonomy.forEach(element => {
              element.title = element.code + ' ' + element.title;
              element.label1 = 'Leader';
              element.line1 = element.leader;
              element.label2 = 'Co-leader';
              element.line2 = element.subleader;
              element.label3 = 'Co-leader';
              element.line3 = element.subleader;
            });
            break;
          case 'capacity':
            this.taxonomytitle = 'Participants / Roles';
            this.taxonomysubtitle = "Action's People";
            this.taxonomy = data.capacity;
            break;
        }
      }
    });
  }

}
