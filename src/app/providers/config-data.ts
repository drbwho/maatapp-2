import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigData {

  ENABLE_PUSH_NOTIFICATIONS = false;

  API_URL = 'https://maatpeasant.com/api';
  API_CSRF_URL = 'https://maatpeasant.com/sanctum/csrf-cookie';

  API_LOGIN_URL = this.API_URL + '/login';
  API_GETAUTH_URL = this.API_URL + '/get-auth';

  GET_API_URL = (type, id = '') => {
    switch(type){
      case 'countries':
        return this.API_URL + '/v1/countries';
        break;
      case 'meetings':
        return this.API_URL + `/v1/groups/${id}/meetings`;
        break
      case 'accounts':
        return  this.API_URL + `/v1/groups/${id}/accounts`;
        break;
      case 'params':
          return  this.API_URL + `/v1/countries/${id}/parameters`;
          break;
      case 'operations':
          return  this.API_URL + `/v1/meetings/${id}/operations`;
          break;
      case 'groups':
          return  this.API_URL + `/v1/groups`;
          break;
      case 'tickets':
          return  this.API_URL + `/v1/tickets`;
          break;
    }
  }

  API_FCM_URL = this.API_URL + '/v1/register-fcm';

  GET_FILE = (type) => {
    switch(type){
      case 'countries':
        return 'COUNTRIES_FILE';;
        break;
      case 'meetings':
        return 'MEETINGS_FILE';
        break
      case 'accounts':
        return 'ACCOUNTS_FILE';
        break;
      case 'params':
        return 'PARAMETERS_FILE';
        break;
    }
  }

  TRANSACTIONS_FILE = 'TRANSACTIONS_FILE';
  HISTORY_TRANSACTIONS_FILE = 'HISTORY_TRANSACTIONS_FILE';
  UPLOAD_ERRORS_FILE = 'UPLOAD_ERRORS_FILE';
  NEWMEETINS_FILE = 'NEWMEETINGS_FILE';

  DEVICE_ID = 'DEVICE_ID';

  APPLICATION_LANGUAGE = "APPLICATION_LANGUAGE";
  AVAILABLE_LANGUAGES = [
    {
     code: "en",
     title: "English"
    },
    {
     code: "fr",
     title: "Francais"
    }
  ];

  constructor() { }
}
