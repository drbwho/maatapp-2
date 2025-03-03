import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'about-app',
    templateUrl: './about-app.page.html',
    styleUrls: ['./about-app.page.scss'],
    standalone: false
})
export class AboutAppPage implements OnInit{
  backimage: string = "";

  constructor() { }

  ngOnInit() {
    this.backimage = '/assets/img/about-bkng.png';
  }

}
