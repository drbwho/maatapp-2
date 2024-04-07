import { Platform } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { DataProvider } from '../../providers/provider-data';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { Events } from '../../providers/events';
import { AppComponent } from '../../app.component';
import { ConfigData } from '../../providers/config-data';
import { Browser } from '@capacitor/browser';

@Component({
  selector: 'home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})

export class HomePage implements OnInit {
  conftitle: string;
  backimage: string;
  confpage: string;

  constructor(
    private events: Events,
    private router: Router,
    public dataProvider: DataProvider,
    public plt: Platform,
    private appComponent: AppComponent,
    private config: ConfigData,
    private storage: Storage,
    ) { }

  async ngOnInit() {
    if (this.plt.width() > 500) {
      this.backimage = '/assets/img/Start_BG_screen_without_logo_flat.jpg';
    } else {
      this.backimage = '/assets/img/Start_BG_screen_without_logo.jpg';
    }
  }


  openExternalUrl(url: string) {
    Browser.open(
      {url: url}
    )
  }

}
