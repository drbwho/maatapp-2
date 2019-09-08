import { Component, ViewEncapsulation } from '@angular/core';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ActionSheetController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { ConferenceData } from '../../providers/conference-data';


@Component({
  selector: 'page-people-list',
  templateUrl: 'people.html',
  styleUrls: ['./people.scss'],
})
export class PeoplePage {
  speakers: any[] = [];
  taxonomy: string;
  pagetitle: string;

  constructor(
    public actionSheetCtrl: ActionSheetController,
    public confData: ConferenceData,
    public inAppBrowser: InAppBrowser,
    public route: ActivatedRoute
  ) {}

  ionViewDidEnter() {
    // load people with filters
    const showWhat = this.route.snapshot.paramMap.get('showWhat');
    const taxName = this.route.snapshot.paramMap.get('taxName');
    const taxId = this.route.snapshot.paramMap.get('taxId');
    this.pagetitle = 'Speakers';
    switch (taxName) {
      case 'capacity':
        this.pagetitle = 'People';
        break;
      case 'wg':
        this.pagetitle = 'People';
        break;
    }
    if (taxName && taxId) {
      this.confData.getTaxonomy(taxName, taxId).subscribe( res => {
        this.taxonomy = res[0].title;
      });
    }

    this.confData.getSpeakers(showWhat, taxName, taxId).subscribe((data: any = []) => {
      this.speakers = data;
    });
  }

  goToSpeakerTwitter(speaker: any) {
    this.inAppBrowser.create(
      `https://twitter.com/${speaker.twitter}`,
      '_blank'
    );
  }

  async openSpeakerShare(speaker: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Share ' + speaker.name,
      buttons: [
        {
          text: 'Copy Link',
          handler: () => {
            console.log(
              'Copy link clicked on https://twitter.com/' + speaker.twitter
            );
            if (
              (window as any)['cordova'] &&
              (window as any)['cordova'].plugins.clipboard
            ) {
              (window as any)['cordova'].plugins.clipboard.copy(
                'https://twitter.com/' + speaker.twitter
              );
            }
          }
        },
        {
          text: 'Share via ...'
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async openContact(speaker: any) {
    const mode = 'ios'; // this.config.get('mode');

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Contact ' + speaker.name,
      buttons: [
        {
          text: `Email ( ${speaker.email} )`,
          icon: mode !== 'ios' ? 'mail' : null,
          handler: () => {
            window.open('mailto:' + speaker.email);
          }
        },
        {
          text: `Call ( ${speaker.phone} )`,
          icon: mode !== 'ios' ? 'call' : null,
          handler: () => {
            window.open('tel:' + speaker.phone);
          }
        }
      ]
    });

    await actionSheet.present();
  }
}
