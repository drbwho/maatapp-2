import { Platform, Events } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { ConferenceData } from './../../providers/conference-data';
import { Router } from '@angular/router';

@Component({
  selector: 'home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})


export class HomePage implements OnInit {
  conftitle: string;
  backimage: string;

  constructor(
    private events: Events,
    private router: Router,
    public dataProvider: ConferenceData,
    public plt: Platform
    ) { }

  ngOnInit() {

    if (this.plt.width() > 500) {
      this.backimage = '/assets/img/Start_BG_screen_without_logo_flat.jpg';
    } else {
      this.backimage = '/assets/img/Start_BG_screen_without_logo.jpg';
    }
    this.dataProvider.load().subscribe((data: any) => {
      if (data && data.eventdates) {
          this.conftitle = data.info[0].title;
        }
      });
  }

  loadTaxonomyPage (page: any) {
    this.events.publish('taxonomy:updated', page);
    this.router.navigate(['/app/tabs/taxonomy/type/' + page], {state: {updateInfos: true}});
  }

}
