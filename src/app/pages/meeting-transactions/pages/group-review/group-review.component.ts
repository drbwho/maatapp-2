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
    
    this.current_maats = parseFloat(this.group.account.restearembourser) - parseFloat(this.meeting.totals.loans)
                         + parseFloat(this.meeting.totals.reimbursements);

    // meeting totals and accounts' totals are calculated in previous (settlement) page
    // set meeting.totals and account.totals
    this.storage.get(this.config.TRANSACTIONS_FILE).then((trns)=>{
      // Group Transactions // TODO check if group transactions!!!!
      let transactions = trns.filter((s)=> s.idaccount == this.group.account.id && s.idmeeting == this.meeting.id);
      if(transactions){
        transactions.forEach((tr)=>{
          this.amount[tr.idparameter] = tr.amount;
        })
      }
    });

    this.parameters = this.country.parameters.filter((s) => s.type == 2);
  }

}
