import { NewsData } from './../../providers/news-data';
import { UserData } from './../../providers/user-data';
import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage implements OnInit {
  news: any;

  constructor(public newsdata: NewsData) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.newsdata.load().subscribe( (data: any) => {
      this.news = data;
      });
  }

}
