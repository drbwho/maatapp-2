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
  totals = {'RCB': 0.0,'AID': 0.0,'AST': 0.0, 'ALL': 0.0}
  selectAll = false;

  constructor(
    private dataProvider: DataProvider,
    private operationTools: OperationTools
  ) { }

  ngOnInit() {
    this.numberofmembers = this.group.numberofmembers;
    this.accounts = this.accounts.filter(m => m.isPresent);
    this.attendance = this.accounts.length;

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

  update_cntrb(parameter_code){
    let amount = 0;
    switch(parameter_code){
      case 'RCB':
        amount = parseFloat(this.group.settings.regcontribution);
        break;
      case 'AID':
        amount = parseFloat(this.group.settings.regsfcontribution);
        break;
      case 'AST':
        amount = parseFloat(this.group.settings.regfacilpayment);
        break;
      case 'ENF':
        amount = parseFloat(this.group.settings.entryfee);
        break;
    }
    return amount;
  }

  async submit_operations(){
    let contribs = ['RCB','AID','AST'];
    let params = this.parameters.filter(p => contribs.includes(p.code));
    let amount = 0;
    let categories=""; let notes="";
    this.totals = {'RCB': 0.0,'AID': 0.0,'AST': 0.0, 'ALL': 0.0}

    // use for() with awaits!!!!
    for (const prm of params){  
      amount = this.update_cntrb(prm.code);
      this.accounts.filter(a => a.selected);
      for (const acc of this.accounts){
        await this.operationTools.newOperation(
            this.meeting.id, acc, this.group, prm.id, prm.name, amount, categories, notes);
          this.totals[prm.code] += amount;
          this.totals['ALL'] += amount;
      };
    };
  }

}
