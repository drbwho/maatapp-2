import { Component, OnInit } from '@angular/core';
import { DataProvider } from '../../providers/provider-data';
import { ActivatedRoute, Router } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../providers/config-data';
import { TranslateService } from '@ngx-translate/core';
import { NavController } from '@ionic/angular';
import { Events } from '../../providers/events';

@Component({
    selector: 'app-groups',
    templateUrl: './groups.page.html',
    styleUrls: ['./groups.page.scss'],
    standalone: false
})
export class GroupsPage implements OnInit {
  country: any;
  groups: any;
  countryname: any;
  queryText: string;
  searchPlaceholder: string;
  currentid: 0;

  constructor(
    private dataProvider: DataProvider,
    private route: ActivatedRoute,
    private router: Router,
    private storage: Storage,
    private config: ConfigData,
    private translate: TranslateService,
    private navController: NavController,
    private event: Events
  ) { }

  ngOnInit() {
  }

  async ionViewWillEnter() {
    const countryId = this.route.snapshot.paramMap.get('countryId');

    this.dataProvider.fetch_data('countries', null, false, true).then((data: any) =>{
      this.country = data.find((s) => s.id == countryId);
      this.groups = this.country.groups;
      this.countryname = this.country.name;
      //Load Country's parameters
      this.dataProvider.fetch_data('params', this.country.id, true).then((data: any)=> {
        this.storage.set(this.config.GET_FILE('params'), data);
      });
    });

    this.translate.get('search').subscribe((keys:any)=>{
      this.searchPlaceholder = keys;
    })

    var current = await this.dataProvider.getCurrent();
    if(current && current.group){
      this.currentid = current.group.id;
    }
  }

  async navto(group){
    // Set current group
    var current = await this.dataProvider.getCurrent();
    current.group = group;
    this.dataProvider.setCurrent(current).then(()=>{
      this.navController.navigateRoot('/app/tabs/dashboard',{
        animated: true,
        animationDirection: 'forward'
      });
    });
  }

 
  searcher(){
    if(this.queryText == ''){
      this.groups = this.country.groups;
      return;
    }

    let queryText = this.queryText.toLowerCase().replace(/,|\.|-/g, ' ');
    const queryWords = queryText.split(' ').filter(w => !!w.trim().length);

    this.groups = [];
    let groups = this.country.groups;
    groups.forEach((gr: any) => {
      if (queryWords.length) {
        queryWords.forEach((queryWord: string) => {
          if (gr.name.toLowerCase().indexOf(queryWord) > -1) {
            this.groups.push(gr);
          }
        });
      }
    });
  }

}
