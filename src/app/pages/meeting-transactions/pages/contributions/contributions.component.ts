import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-contributions',
  templateUrl: './contributions.component.html',
  styleUrls: ['./contributions.component.scss'],
  standalone: false
})
export class ContributionsComponent  implements OnInit {
  @Input() group: any;
  @Input() accounts: any;
  @Input() country: any;
  numberofmembers = 0;
  attendance = 0;
  total_regcontrib = 0;
  total_sfregcontrib = 0;
  total_fcpcontrib = 0;
  total_collection = 0;
  selectAll = false;

  constructor() { }

  ngOnInit() {
    this.numberofmembers = this.group.numberofmembers;
    this.accounts = this.accounts.filter(m => m.isPresent);
    this.attendance = this.accounts.length;
  }

  onSelectAllChange() {
    this.accounts.forEach(acc => acc.selected = this.selectAll);
  }

  toggleAccount(acc: any) {
    acc.selected = !acc.selected;
  }

}
