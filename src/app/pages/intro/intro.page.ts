import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { UserData } from '../../providers/user-data';
import { Platform } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

import { Page1Component } from './pages/page-1/page-1.component';
import { Page2Component } from './pages/page-2/page-2.component';
import { Page3Component } from './pages/page-3/page-3.component';
import { Page4Component } from './pages/page-4/page-4.component';
import { Page5Component } from './pages/page-5/page-5.component';
import { Page6Component } from './pages/page-6/page-6.component';
import { Page7Component } from './pages/page-7/page-7.component';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
  standalone: false
})
export class IntroPage implements OnInit {
  pageId = 1;
  nextPage = 2;
  introPageComponent = null;

  readonly componentMap = {
    1: Page1Component,
    2: Page2Component,
    3: Page3Component,
    4: Page4Component,
    5: Page5Component,
    6: Page6Component,
    7: Page7Component,
  };

  constructor(
    private router: Router,
    private plt: Platform,
    private translateService: TranslateService,
    private userData: UserData,
    private route: ActivatedRoute
    ) { }

  async ngOnInit() {
    this.userData.isLoggedIn().then((value)=>{
        if(!value){       
          this.router.navigate(['/login'], {state: {updateInfos: true}});
        }
    });

    if (this.plt.width() > 500) {
      //this.backimage = '/assets/img/Start_BG_screen_without_logo_flat.jpg';
    } else {
      //this.backimage = '/assets/img/8-sm.png';//Start_BG_screen_without_logo.jpg';
    }

    this.route.paramMap.subscribe(params => {
      const curId = parseInt(params.get('pageId'));
      if(curId){
        this.pageId = curId;
        this.nextPage = curId + 1;
      }
      if(this.pageId > 7){
         this.router.navigate(['/app/tabs/dashboard'], {state: {updateInfos: true}});
      }
      this.introPageComponent = this.componentMap[this.pageId];
    });
  }
}
