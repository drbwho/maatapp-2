import { ConfigData } from './../../providers/config-data';
import { HttpClientModule } from '@angular/common/http';
import { Component, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { UserData } from '../../providers/user-data';

import { UserOptions } from '../../interfaces/user-options';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController } from '@ionic/angular';
import { LookupAllOptions } from 'dns';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage {
  login: UserOptions = { username: '', password: '' };
  submitted = false;

  constructor(
    public userData: UserData,
    public router: Router,
    public http: HttpClient,
    public alertController: AlertController,
    public config: ConfigData
  ) { }

  onLogin(form: NgForm) {
    this.submitted = true;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    if (form.valid) {
      this.http.post(this.config.API_LOGIN_URL, {"email": this.login.username, "password": this.login.password}, {headers: headers})
      .subscribe( async (data: any) => {
        console.log('logged in:' + data.user.username);
        if (data.status) {
          this.userData.login(data.user);
          this.router.navigateByUrl('/home');
        } else {
          const alert = await this.alertController.create({
            header: 'Error',
            message: 'User or password dont match!',
            buttons: [
                {
                text: 'Ok',
                handler: () => {
                  console.log('Confirm Okay');
                }
              }
            ]
          });
          await alert.present();
        }
       }, async error => {
        console.log(error);
        const alert = await this.alertController.create({
          header: 'Error',
          message: 'Authentication error!',
          buttons: [
              {
              text: 'Ok',
              handler: () => {
                console.log('Confirm Okay');
              }
            }
          ]
        });
        await alert.present();
      });
    }
  }

  onSignup() {
    this.router.navigateByUrl('/signup');
  }
}
