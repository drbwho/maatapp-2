import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { ActionSheetController, AlertController, Platform } from '@ionic/angular';
import { Component } from '@angular/core';
import { Calendar } from '@awesome-cordova-plugins/calendar/ngx';
import { Router } from '@angular/router';

import { ConferenceData } from '../../providers/conference-data';
import { ActivatedRoute } from '@angular/router';
import { UserData } from '../../providers/user-data';
import { Browser } from '@capacitor/browser';

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
    public calendar: Calendar,
    public alertController: AlertController,
    public socialsharing: SocialSharing,
    public plt: Platform,
    private router: Router

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
              if (session && session.id == sessionId) {
                this.session = session;
                this.session.datestr = new Date(this.session.date.replace(/-/g, '/')).toLocaleDateString('en-US',
                            { day: 'numeric', month: 'long', year: 'numeric' });
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
    Browser.open({url: `https://twitter.com/${speaker.twitter}`});
  }

  async openSpeakerShare(speaker: any) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Share ' + speaker.fname + speaker.lname,
      buttons: [
        {
          text: 'Copy Twitter Link',
          handler: () => {
            console.log(
              'Copy link clicked on https://twitter.com/' + speaker.twitter
            );
            if (
              (window as any).cordova &&
              (window as any).cordova.plugins.clipboard
            ) {
              (window as any).cordova.plugins.clipboard.copy(
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
      header: 'Contact ' + speaker.fname + ' ' + speaker.lname,
      buttons: [
        {
          text: `Email ( ${speaker.mail} )`,
          icon: mode !== 'ios' ? 'mail' : null,
          handler: () => {
            Browser.open({url: 'mailto:' + speaker.mail});
          }
        },
        {
          text: `Call ( ${speaker.phone} )`,
          icon: mode !== 'ios' ? 'call' : null,
          handler: () => {
            if(speaker.phone){
              Browser.open({url: 'tel:' + speaker.phone});
            }
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

  open_file(session, type) {
    this.dataProvider.getFiles(session.id).subscribe( async res => {
      const file = res.filter( (item: any) => {
                          return item.type === type;
                        });
      if (file.length === 0) {
        const alert = await this.alertController.create({
          header: 'Info',
          message: 'Session has no files yet',
          buttons: [
            {
            text: 'Ok',
            handler: () => {
              console.log('No file');
              }
            }
          ]
        });
        await alert.present();
      } else {
        // restrict access
        this.userProvider.isLoggedIn().then((value)=>{
          if(!value){
            this.user_not_loggedin();
          }else{
            //this.inAppBrowser.create(file[0].fileUrl, '_system', 'location=no,toolbar=yes,closebuttoncaption=Close PDF,enableViewportScale=yes');
            Browser.open({url: file[0].fileUrl});
          }
        });
      }
    });
  }

  async user_not_loggedin(){
    const alert = await this.alertController.create({
      header: 'Info',
      message: 'You must login to gain access',
      buttons: [
        {
        text: 'Login',
        handler: () => {
          console.log('Not logged in');
          this.router.navigate(['/login']);
          }
        },
        {
        text: 'Cancel',
        handler: () => {
          alert.dismiss();
          }
        }
      ]
    });
    await alert.present();
  }

  createCalendar(session) {
    const title  = 'Attend session: ' + session.title;
    let startDate;
    let endDate;
    if (this.plt.is('ios')) {
      startDate = new Date(session.datestr + ' ' + session.startTime + ':00');
      endDate = new Date(session.datestr + ' ' + session.endTime);
      startDate = new Date(startDate.getFullYear(),
          Number(('0' + (startDate.getMonth())).slice(-2)),
          Number(('0' + startDate.getDate()).slice(-2)),
          Number(('0' + startDate.getHours()).slice(-2)),
          Number(('0' + startDate.getMinutes()).slice(-2)) );
      endDate = new Date(endDate.getFullYear(),
        Number(('0' + (endDate.getMonth())).slice(-2)),
        Number(('0' + endDate.getDate()).slice(-2)),
        Number(('0' + endDate.getHours()).slice(-2)),
        Number(('0' + endDate.getMinutes()).slice(-2)) );
    } else {
      startDate = new Date(session.date + ' ' + session.startTime + ':00');
      endDate = new Date(session.date + ' ' + session.endTime);
    }
    const success = function(message) { alert('Success: ' + JSON.stringify(message)); };
    const error = function(message) { alert('Error: ' + message); };
    const eventLocation = '';
    const notes = 'Session Reminder: ' + session.title;

    const calendarName = 'My Sessions';

    const calOptions = this.calendar.getCalendarOptions(); // grab the defaults
    calOptions.firstReminderMinutes = 60; // default is 60, pass in null for no reminder (alarm)
    calOptions.secondReminderMinutes = 5;
    calOptions.recurrence = 'none'; // supported are: daily, weekly, monthly, yearly
    calOptions.recurrenceEndDate = endDate; // leave null to add events into infinity and beyond
    calOptions.calendarName = calendarName; // iOS only
    // calOptions.calendarId = 1; // Android only, use id obtained from listCalendars() call which is described below.
    // This will be ignored on iOS in favor of calendarName and vice versa. Default: 1.

    // This is new since 4.2.7:
    calOptions.recurrenceInterval = 1;

    if (this.plt.is('ios')) {
      this.calendar.createCalendar(calendarName).then( () => {
        this.calendar.createEventInteractivelyWithOptions(title, eventLocation, notes, startDate, endDate, calOptions);
      });
    } else {
      this.calendar.createEventInteractivelyWithOptions(title, eventLocation, notes, startDate, endDate, calOptions);
    }
  // }

  }

  async evaluate_session(session) {
    const alert = await this.alertController.create({
      header: 'Info',
      message: 'Session Evaluation is not enabled',
      buttons: [
        {
        text: 'Ok',
        handler: () => {
          }
        }
      ]
    });
    await alert.present();
  }
}
