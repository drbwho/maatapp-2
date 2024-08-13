import { Component, OnInit } from '@angular/core';
import { Events } from '../../providers/events';
import { AppComponent } from '../../app.component';

@Component({
  selector: 'app-status-icons',
  templateUrl: './status-icons.component.html',
  styleUrls: ['./status-icons.component.scss'],
})
export class StatusIconsComponent  implements OnInit {
  network_status = false;

  constructor(private events: Events, private appcomponent: AppComponent) { }

  ngOnInit() {
    this.network_status = this.appcomponent.networkStatus;

    this.events.subscribe('network:connect', () => {
      this.network_status = true;
    });
    this.events.subscribe('network:disconnect', () => {
      this.network_status = false;
    });
  }

}
