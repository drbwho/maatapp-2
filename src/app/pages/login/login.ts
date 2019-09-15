import { HttpClientModule } from '@angular/common/http';
import { Component, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { UserData } from '../../providers/user-data';

import { UserOptions } from '../../interfaces/user-options';
import { HttpClient } from '@angular/common/http';
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
  API_LOGIN_URL = 'https://bkk-apps.com:9443/cod-mobile/user-authorization';

  constructor(
    public userData: UserData,
    public router: Router,
    public http: HttpClient,
    public alertController: AlertController
  ) { }

  onLogin(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      this.http.get(this.API_LOGIN_URL + '?uname=' + this.login.username + '&pass=' + this.login.password)
      .subscribe( async (data: any) => {
        console.log('logged in:' + data['_body']);
        if (data.uid) {
          this.userData.login(data);
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
       }, error => {
        console.log(error);
      });
    }
  }

  onSignup() {
    this.router.navigateByUrl('/signup');
  }
}
