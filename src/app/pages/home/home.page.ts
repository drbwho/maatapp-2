import { Component, OnInit } from '@angular/core';
import { ConferenceData } from './../../providers/conference-data';

@Component({
  selector: 'home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  conftitle: string;

  constructor(public dataProvider: ConferenceData) { }

  ngOnInit() {
    this.dataProvider.load().subscribe((data: any) => {
      if (data && data.eventdates) {
          this.conftitle = data.info[0].title;;
        }
      });
  }

}
