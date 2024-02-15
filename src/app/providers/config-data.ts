import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigData {

  ENABLE_PUSH_NOTIFICATIONS = true;

  API_URL = 'https://precision-btc.eu/api';
  CHAT_HOST = 'chat.bkk-apps.com';
  API_CSRF_URL = 'https://precision-btc.eu/sanctum/csrf-cookie';

  API_LOGIN_URL = this.API_URL + '/login';
  API_GETAUTH_URL = this.API_URL + '/get-auth';

  JSON_FILE = 'JSON_FILE';
  API_EVENTS_URL =  this.API_URL + '/v1/events';
  API_JSONFILE_VERSION = this.API_URL + '/json-version';
  API_JSONFILE_URL = this.API_URL + '/v1/event';
  API_FCM_URL = this.API_URL + '/v1/register-fcm';

  SESSION_RATINGS = 'SESSION_RATINGS';
  MY_SESSION_RATINGS = 'MY_SESSION_RATINGS';
  MY_SESSION_REVIEWS = 'MY_SESSION_REVIEWS';
  API_GETRATINGS_URL = this.API_URL + '/v1/get-session-rating';
  API_SETRATING_URL = this.API_URL + '/cod-mobile/session-rating';
  API_SETREVIEWS_URL = this.API_URL + '/cod-mobile/session-reviews';
  API_NEWS_URL =  this.API_URL + '/v1/get-news';

  NEWS_FILE = 'NEWS_FILE';
  HAS_UNREAD_NEWS = 'has_unread_news';
  
  MEETINGS_FILE = 'MEETINGS_FILE';
  CUR_MEETING = "CUR_EVENT";

  DEVICE_ID = 'DEVICE_ID';

  constructor() { }
}
