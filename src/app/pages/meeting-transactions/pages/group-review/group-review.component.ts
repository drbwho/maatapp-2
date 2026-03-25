import { Component, OnInit, Input } from '@angular/core';
 import { OperationTools } from '../../../../providers/operation-tools';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../../../providers/config-data';

@Component({
  selector: 'app-group-review',
  templateUrl: './group-review.component.html',
  styleUrls: ['./group-review.component.scss'],
  standalone: false
})
export class GroupReviewComponent  implements OnInit {
  @Input() group: any;
  @Input() accounts: any;
  @Input() country: any;
  @Input() meeting: any;
  attendance = 0;
  numberofmembers = 0;
  parameters: any;
  tr_icons: any;
  amount: number[]=[];
  current_maats = 0;
  details:any = {};
  show_details = false;

  constructor(
    private operTools: OperationTools,
    private storage: Storage,
    private config: ConfigData
  ) { }

  async ngOnInit() {
    this.numberofmembers = this.group.numberofmembers;
    this.accounts = this.accounts.filter(m => m.isPresent);
    this.attendance = this.accounts.length;
    this.tr_icons = this.operTools.tr_icons;

    this.parameters = this.country.parameters.filter((s) => s.type == 2); // Group Parameters

    this.current_maats = parseFloat(this.group.account.restearembourser) - parseFloat(this.meeting.totals.loans)
                         + parseFloat(this.meeting.totals.reimbursements);

    // meeting totals and accounts' totals are calculated in previous (settlement) page
    // set meeting.totals and account.totals
    this.storage.get(this.config.TRANSACTIONS_FILE).then((trns)=>{
      // Group Transactions // TODO check if group transactions!!!!
      if(trns){
        let transactions = trns.filter((s)=> s.idaccount == this.group.account.id && s.idmeeting == this.meeting.id);
        transactions.forEach((tr)=>{
          this.amount[tr.idparameter] = tr.amount;
        })
      }
    });
  }

  async clear_amount(parameterId){
    delete(this.amount[parameterId]);
    await this.operTools.delOperationByParameter(this.group.account.id, this.meeting.id, parameterId);
    this.meeting.totals = await this.operTools.estimate_meeting_totals(this.group.account, this.meeting.id)
  }

  async update_transaction(parameterId, e: Event){
    let paramname = (this.parameters.find(p => p.id == parameterId)).name;
    await this.operTools.newOperation(
      this.meeting.id, this.group.account, this.group, parameterId, paramname, this.amount[parameterId], "", "");
    this.meeting.totals = await this.operTools.estimate_meeting_totals(this.group.account, this.meeting.id)
  }

}
