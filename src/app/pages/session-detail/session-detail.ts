import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { ActionSheetController } from '@ionic/angular';
import { Component } from '@angular/core';

import { ConferenceData } from '../../providers/conference-data';
import { ActivatedRoute } from '@angular/router';
import { UserData } from '../../providers/user-data';

@Component({
  selector: 'page-session-detail',
  styleUrls: ['./session-detail.scss'],
  templateUrl: 'session-detail.html'
})
export class SessionDetailPage {
  session: any = [];
  isFavorite = false;
  ratings: number;
  myratings: number;
  defaultHref = '';

  constructor(
    private dataProvider: ConferenceData,
    private userProvider: UserData,
    private route: ActivatedRoute,
    public actionSheetCtrl: ActionSheetController,
    public inAppBrowser: InAppBrowser
  ) {}
  sessionClick(item: string) {
    console.log('Clicked', item);
  }
  toggleFavorite() {
    if (this.userProvider.hasFavorite(this.session.title)) {
      this.userProvider.removeFavorite(this.session.title);
      this.isFavorite = false;
    } else {
      this.userProvider.addFavorite(this.session.title);
      this.isFavorite = true;
    }
  }
  ionViewWillEnter() {
    this.dataProvider.load().subscribe(async (data: any) => {
      if (
        data &&
        data.eventdates &&
        data.eventdates[0] &&
        data.eventdates[0].sessions
      ) {
        const sessionId = this.route.snapshot.paramMap.get('sessionId');
        for (const day of data.eventdates) {
            for (const session of day.sessions) {
              if (session && session.id === sessionId) {
                this.session = session;
                this.session.date = new Date(this.session.date).toLocaleDateString('en-US',
                          { day: 'numeric', month: 'long', year: 'numeric' });
                this.isFavorite = this.userProvider.hasFavorite(
                  this.session.title
                );
                break;
              }
            }
          }

          this.dataProvider.getSessionRatings(sessionId).then( res => {
            this.ratings = res;
          });

          this.dataProvider.getMySessionRatings(sessionId).then( res => {
            this.myratings = res;
          });
        }
    });
  }

  ionViewDidEnter() {
    this.defaultHref = `/app/tabs/schedule`;
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
      header: 'Contact ' + speaker.fname + speaker.lname,
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

  put_session_rating(sessionid, rate) {
    this.dataProvider.putSessionRating(sessionid, rate);
    this.userProvider.isLoggedIn().then(res => {
      if (res) {
        this.myratings = rate;
      }
    });
  }
}
