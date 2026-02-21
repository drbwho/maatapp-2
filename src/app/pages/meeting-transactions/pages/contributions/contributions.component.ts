import { Component, OnInit, Input } from '@angular/core';
import { DataProvider } from '../../../../providers/provider-data';
import { OperationTools } from '../../../../providers/operation-tools';

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
  @Input() meeting: any;
  numberofmembers = 0;
  attendance = 0;
  parameters: any;
  totals = {};
  selectAll = false;

  constructor(
    private dataProvider: DataProvider,
    private operationTools: OperationTools
  ) { }

  ngOnInit() {
    this.numberofmembers = this.group.numberofmembers;
    this.accounts = this.accounts.filter(m => m.isPresent);
    this.attendance = this.accounts.length;
    this.resetTotals();
    this.readTotals();

    this.dataProvider.fetch_data('params', this.country.id, true).then((data: any)=> {
      this.parameters = data;
    });
  }

  onSelectAllChange() {
    this.accounts.forEach(acc => acc.selected = this.selectAll);
    this.submit_operations();
  }

  toggleAccount(acc: any) {
    acc.selected = !acc.selected;
    this.submit_operations();
  }

  resetTotals(){
    this.operationTools.contrib_operations.forEach(c => this.totals[c] = 0.0);
    this.totals['ALL'] = 0;
  }

  async readTotals(){
    this.totals = await this.operationTools.get_contribution_totals(this.meeting.id);
  }

  async submit_operations(){
    let contribs = this.operationTools.contrib_operations;
    let params = this.parameters.filter(p => contribs.includes(p.code));
    let amount = 0;
    let categories=""; let notes="";
    this.resetTotals();

    // use for() with awaits!!!!
    for (const prm of params){
      amount = parseFloat(this.group.settings[this.operationTools.map_default_to_settings[prm.code]]);
      this.accounts.filter(a => a.selected);
      for (const acc of this.accounts){
        await this.operationTools.newOperation(
            this.meeting.id, acc, this.group, prm.id, prm.name, amount, categories, notes);
      };
    };
    this.readTotals();
  }

}
