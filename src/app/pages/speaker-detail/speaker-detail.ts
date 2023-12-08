import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Browser } from '@capacitor/browser';
import { ConferenceData } from '../../providers/conference-data';

@Component({
  selector: 'page-speaker-detail',
  templateUrl: 'speaker-detail.html',
  styleUrls: ['./speaker-detail.scss'],
})
export class SpeakerDetailPage {
  speaker: any;

  constructor(
    private dataProvider: ConferenceData,
    private route: ActivatedRoute,
  ) {}

  ionViewWillEnter() {
    this.dataProvider.load().subscribe((data: any) => {
      const speakerId = this.route.snapshot.paramMap.get('speakerId');
      if (data && data.people) {
        for (const speaker of data.people) {
          if (speaker && speaker.id === speakerId) {
            this.speaker = speaker;
            break;
          }
        }
      }
    });
  }

  openExternalUrl(url: string) {
    Browser.open({url: url});
  }
}
