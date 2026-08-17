import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { Animation, createAnimation, NavController } from '@ionic/angular';
import { UserData } from '../../providers/user-data';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class SplashPage implements OnInit {
  showWelcome = false;

  constructor(
    private router: Router,
    private userData: UserData,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.userData.isLoggedIn().then((value)=>{
      setTimeout(() => {
        this.showWelcome = true;
        setTimeout(() => {
          if(!value){
            this.navCtrl.navigateRoot('/login',
          {animated: true, animation: this.fadeAnimation});
          }else{
            this.navigateToMain();
          }
        }, 4000);
      }, 2000);
    });
  }

  async navigateToMain() {
    // show introduction?
    if(!await this.userData.shownIntro()){
      this.navCtrl.navigateRoot('/intro',
          {animated: true, animation: this.fadeAnimation});
    }else{
      this.navCtrl.navigateRoot('/app/tabs/dashboard',
          {animated: true, animation: this.fadeAnimation});
    }
  }

  fadeAnimation = (baseEl: HTMLElement, opts?: any): Animation => {
    const enteringAnimation = createAnimation()
      .addElement(opts.enteringEl)
      .fromTo('opacity', 0, 1)
      .duration(2000);

    const leavingAnimation = createAnimation()
      .addElement(opts.leavingEl)
      .fromTo('opacity', 1, 0)
      .duration(2000);

    return createAnimation()
      .addAnimation([enteringAnimation, leavingAnimation]);
  };
}
