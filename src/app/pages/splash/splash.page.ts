import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserData } from '../../providers/user-data';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.page.html',
  styleUrls: ['./splash.page.scss'],
  standalone: false
})
export class SplashPage implements OnInit {
  showWelcome = false;

  constructor(
    private router: Router,
    private userData: UserData
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.userData.isLoggedIn().then((value)=>{
      setTimeout(() => {
        this.showWelcome = true;
        setTimeout(() => {   
          if(!value){    
            this.router.navigate(['/login'], {state: {updateInfos: true}});
          }else{
            this.navigateToMain();
          }
        }, 3000);
      }, 2000);
    });
  }

  async navigateToMain() {
    // show introduction?
    if(!await this.userData.shownIntro()){   
      this.router.navigate(['/intro'], { replaceUrl: true });
    }else{
      this.router.navigate(['/app/tabs/dashboard'], { replaceUrl: true });
    }
  }
}
