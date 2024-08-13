import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigData {

  ENABLE_PUSH_NOTIFICATIONS = false;

  API_URL = 'http://bkk-apps.com:8001/api';
  API_CSRF_URL = 'http://bkk-apps.com:8001/sanctum/csrf-cookie';

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
      case 'parameters':
          return 'PARAMETERS_FILE';
          break;
    }
  }

  DEVICE_ID = 'DEVICE_ID';

  constructor() { }
}
