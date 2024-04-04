import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'about-app',
  templateUrl: './about-app.page.html',
  styleUrls: ['./about-app.page.scss'],
})
export class AboutAppPage implements OnInit{
  backimage: string = "";

  constructor() { }

  ngOnInit() {
    this.backimage = '/assets/img/about-bkng.png';
  }

}
