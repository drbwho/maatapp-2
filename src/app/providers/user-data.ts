import { Injectable, OnInit } from '@angular/core';
import { Events } from './events';
import { Storage } from '@ionic/storage';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigData } from './config-data';

@Injectable({
  providedIn: 'root'
})
export class UserData {
  _favorites: string[] = [];
  FAVOURITES_FILE = 'FAVOURITES_FILE';
  USER_FILE = 'USER_FILE';
  HAS_LOGGED_IN = 'hasLoggedIn';
  user: any;

  constructor(
    public events: Events,
    public storage: Storage,
    private http: HttpClient,
    private config: ConfigData,
  ) { }

  async checkAuth(){
    const user = await this.getUser();
    if(!user) {
      return false;
    }

    // user is logged in, check session duration
    var diff = Math.abs(user.lastlogin.getTime() - (new Date()).getTime());
    var diffDays = Math.ceil(diff / (1000 * 3600 * 24));
    if(diffDays < 10){ // TODO set parametric?
      return true;
    }

    const headers =  new HttpHeaders({
      'Authorization': 'Bearer ' + user.token,
      'Accept': 'application/json'
    });

    return new Promise((resolve, reject)=>{
      this.http.get(this.config.API_GETAUTH_URL, {headers: headers})
      .subscribe({
        next: (data: any)=>{
            resolve(true);
        },
        error: (error)=>{
          console.log(error.error.message);
          reject(false);
        }
      });
    });
  }

  loadFavorites () {
    this.storage.get(this.FAVOURITES_FILE).then( (res) => {
      if (res === null || res.lenth === 0) {
        this._favorites = [];
      } else {
      this._favorites = res;
      }
    });
  }

  hasFavorite(sessionName: string): boolean {
    return (this._favorites.indexOf(sessionName) > -1);
  }

  addFavorite(sessionName: string): void {
    this._favorites.push(sessionName);
    this.storage.set(this.FAVOURITES_FILE, this._favorites);
  }

  removeFavorite(sessionName: string): void {
    const index = this._favorites.indexOf(sessionName);
    if (index > -1) {
      this._favorites.splice(index, 1);
    }
    this.storage.set(this.FAVOURITES_FILE, this._favorites);
  }

  login(user: any): Promise<any> {
    return this.storage.set(this.HAS_LOGGED_IN, true).then(() => {
      this.setUsername(user).then(()=>{
        return this.events.publish('user:login');
      });
    });
  }

  signup(username: string): Promise<any> {
    return this.storage.set(this.HAS_LOGGED_IN, true).then(() => {
      this.setUsername(username);
      return this.events.publish('user:signup');
    });
  }

  logout(): Promise<any> {
    return this.storage.remove(this.HAS_LOGGED_IN).then(() => {
      return this.storage.remove(this.USER_FILE);
    }).then(() => {
      this.events.publish('user:logout');
    });
  }

  setUsername(user: any): Promise<any> {
    user.lastlogin = new Date();
    return this.storage.set(this.USER_FILE, user);
  }

  getUser(): Promise<any> {
    return this.storage.get(this.USER_FILE).then((value) => {
      return value;
    });
  }

  isLoggedIn(): Promise<boolean> {
    return this.storage.get(this.HAS_LOGGED_IN).then((value) => {
      return value === true;
    });
  }

}
