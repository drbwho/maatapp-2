import { NewsData } from './../../providers/news-data';
import { Component, OnInit } from '@angular/core';
import { Events } from '../../providers/events';

@Component({
  selector: 'news',
  templateUrl: './news.page.html',
  styleUrls: ['./news.page.scss'],
})
export class NewsPage implements OnInit {
  news: any;

  constructor(public newsdata: NewsData, public events: Events) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.newsdata.load().subscribe( (data: any) => {
      this.news = data;
      });
    this.events.publish('user:unreadnews', false);
  }

}
