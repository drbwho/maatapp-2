import { Platform } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { ConferenceData } from './../../providers/conference-data';

@Component({
  selector: 'home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})


export class HomePage implements OnInit {
  conftitle: string;
  backimage: string;
  showBtn = false;
  deferredPrompt;

  constructor(public dataProvider: ConferenceData, public plt: Platform) { }

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

  ionViewWillEnter() {
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later on the button event.
      this.deferredPrompt = e;

    // Update UI by showing a button to notify the user they can add to home screen
      this.showBtn = true;
    });

    // button click event to show the promt

    window.addEventListener('appinstalled', (event) => {
     alert('installed');
    });


    if (window.matchMedia('(display-mode: standalone)').matches) {
      alert('display-mode is standalone');
    }
  }

  add_to_home(e) {
    // hide our user interface that shows our button
    // Show the prompt
    this.deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    this.deferredPrompt.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          alert('User accepted the prompt');
        } else {
          alert('User dismissed the prompt');
        }
        this.deferredPrompt = null;
      });
  }

}
