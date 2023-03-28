import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { Component, ViewEncapsulation } from '@angular/core';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser';
import { ActionSheetController, AlertController } from '@ionic/angular';
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
  rootpage = '';

  constructor(
    public actionSheetCtrl: ActionSheetController,
    public confData: ConferenceData,
    public inAppBrowser: InAppBrowser,
    public route: ActivatedRoute,
    public socialsharing: SocialSharing,
    public alertController: AlertController
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
    if (taxName && taxId && Number(taxId) > 0 ) {
      this.confData.getTaxonomy(taxName, taxId).subscribe( res => {
        this.taxonomy = res[0].title;
      });
      this.rootpage = 'taxonomy/';
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
      header: 'Share ' + speaker.fname + speaker.lname,
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
          text: 'Share via SMS',
          handler: async () => {
            // ask for phonenumber
            const alert = await this.alertController.create({
            header: 'Send SMS!',
            message: 'Please enter the phonenumber of one or more recipients, separated by commas',
            inputs: [
              {
              name: 'text',
              type: 'text',
              placeholder: 'phone number'
              }
            ],
            buttons: [
              {
              text: 'Submit',
              handler: (data) => {
                console.log('Send SMS to:' + data.text);
                this.socialsharing.shareViaSMS('Speaker: ' + speaker.fname + speaker.lname + ' / ' + speaker.org, data);
                }
              }
            ]
            });
            await alert.present();
          }
        },
        {
          text: 'Share via facebook',
          handler: () => {
             this.socialsharing.shareViaFacebook('Speaker: ' + speaker.fname + speaker.lname + ' / ' + speaker.org);
          }
        },
        {
          text: 'Share via instagram',
          handler: () => {
             this.socialsharing.shareViaInstagram('Speaker: ' + speaker.fname + speaker.lname + ' / ' + speaker.org, speaker.prof_img);
          }
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
          text: `Email ( ${speaker.mail} )`,
          icon: mode !== 'ios' ? 'mail' : null,
          handler: () => {
            window.open('mailto:' + speaker.mail, '_system');
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
