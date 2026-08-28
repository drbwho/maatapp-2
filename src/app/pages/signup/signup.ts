import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UserData } from '../../providers/user-data';

import { UserOptions } from '../../interfaces/user-options';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonList, IonItem, IonLabel, IonInput, IonText, IonFooter, IonButton } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'page-signup',
    templateUrl: 'signup.html',
    styleUrls: ['./signup.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        IonHeader,
        IonToolbar,
        IonButtons,
        IonMenuButton,
        IonTitle,
        IonContent,
        IonList,
        IonItem,
        IonLabel,
        IonInput,
        IonText,
        IonButton
    ]
})
export class SignupPage {
    signup: UserOptions = { username: '', password: '' };
    submitted = false;

    constructor(
        public router: Router,
        public userData: UserData
    ) { }

    onSignup(form: NgForm) {
        this.submitted = true;

        if (form.valid) {
            this.userData.signup(this.signup.username);
            this.router.navigateByUrl('/app/schedule');
        }
    }
}
