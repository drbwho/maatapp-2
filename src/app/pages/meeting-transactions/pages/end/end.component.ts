import { Component, OnInit, Input } from '@angular/core';
import { Browser } from '@capacitor/browser';
import { OperationTools } from '../../../../providers/operation-tools';
import { GroupTools } from '../../../../providers/group-tools';
import * as confetti from 'canvas-confetti';

@Component({
  selector: 'app-end',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss'],
  standalone: false
})
export class EndComponent  implements OnInit {
  @Input() group: any;
  @Input() accounts: any;
  @Input() country: any;
  @Input() meeting: any;
  loans_completed = 0;
  loans_to_due = 0;
  show_max = false;
  show_metrics = false;
  max_loans = 0;
  max_collection = 0;
  meeting_health: any;
  image = "";
  description = "";
  heading = "";

  constructor(
    private operTools: OperationTools,
    private groupTools: GroupTools
  ) { }

  ngOnInit() {
    this.calc_views();
  }

  async calc_views(){
    const today = new Date();
    
    this.accounts.forEach(async acc => {
      // cals loans completed
      let totals = await this.operTools.estimate_meeting_totals(acc, this.meeting.id);
      if(totals.transactions.get('REM') && parseFloat(totals.transactions.get('REM')) >= parseFloat(acc.restearembourser)){
        this.loans_completed++;
      }
      //calc loans dues
      if(acc.restearembourser > 0 && acc.dateecheance){
        const givenDate = new Date(acc.dateecheance);
        const diffInMs = givenDate.getTime() - today.getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        if(diffInDays < 7){
          this.loans_to_due++;
        }
      }
    });

    let meetings: any = await this.groupTools.get_meetings(this.group);
    meetings = meetings.filter(m => m.id != this.meeting.id);
    this.max_loans = meetings && meetings.length ? Math.max(...meetings.map(meeting => meeting.loans)) : 0;
    this.max_collection = meetings && meetings.length ? Math.max(...meetings.map(meeting => meeting.collection)) : 0;

    // trigger fireworks?
    if((((this.meeting?.totals?.credit - this.meeting?.totals?.debit) > this.max_collection) && this.max_collection) ||
        ((this.meeting?.totals?.loans > this.max_loans) && this.max_loans)){
      this.triggerFireworks();
    }

    this.meeting_health = await this.groupTools.get_meeting_health(this.meeting, this.group);console.log(this.meeting_health)
    this.heading = 'messages.meetings.'+ this.meeting_health.health_status +'.heading';
    this.description = 'messages.meetings.'+ this.meeting_health.health_status +'.description';
    this.image = 'assets/img/action-views/'+ this.meeting_health.health_status +'-meeting.png';
  }

  async open_url() {
    await Browser.open({ url: 'https://admin.maatpeasant.com/sustain' });
  }

  triggerFireworks() {
    const duration = 5 * 1000; // Total duration: 5secs
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };
    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti.default({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti.default({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250); // Every 250ms trigger a firework
  }

}
