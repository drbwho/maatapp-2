import { Component, OnInit } from '@angular/core';
import { DataProvider } from '../../providers/provider-data';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.page.html',
  styleUrls: ['./groups.page.scss'],
})
export class GroupsPage implements OnInit {
  country: any;
  groups: any;
  countryname: any;
  queryText: string;

  constructor(
    private dataProvider: DataProvider,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    const countryId = this.route.snapshot.paramMap.get('countryId');

    this.dataProvider.fetch_data('countries', null, false, true).then((data: any) =>{
      this.country = data.find((s) => s.id == countryId);
      this.groups = this.country.groups;
      this.countryname = this.country.name;
    });
  }

  navto(group){
    this.dataProvider.current.country = this.country;
    this.dataProvider.current.group = group;
    this.router.navigate(['/app/tabs/groups/'+ group.id], {state: {}});
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
