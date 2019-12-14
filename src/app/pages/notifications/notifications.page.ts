import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage {
  message: any;

  constructor(private route: ActivatedRoute) {
    this.getParams();
  }

  async getParams() {
    this.message = JSON.parse(this.route.snapshot.paramMap.get('data'));
   /*this.route.queryParams.subscribe(params => {
    if (params && params.special) {
      this.message = JSON.parse(params.special);
    }
   });*/
  }

}
