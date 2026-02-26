import { Component, OnInit, Input } from '@angular/core';
import { DataProvider } from '../../../../providers/provider-data';
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
  show_details = false;

  constructor(
    private dataProvider: DataProvider,
    private operTools: OperationTools,
    private storage: Storage,
    private config: ConfigData
  ) { }

  ngOnInit() {
    this.numberofmembers = this.group.numberofmembers;
    this.accounts = this.accounts.filter(m => m.isPresent);
    this.attendance = this.accounts.length;
    this.tr_icons = this.operTools.tr_icons;
    
    this.current_maats = this.group.account.restearembourser - this.group.totals.loans + this.group.totals.reimbursements;
      
    this.storage.get(this.config.TRANSACTIONS_FILE).then((trns)=>{
      if(trns){
        let transactions = trns.filter((s)=>s.accountid == this.group.account.id && s.meetingid == this.meeting.id);
        if(transactions){
          transactions.forEach((tr)=>{
            this.amount[tr.parameterid] = tr.amount;
          })
        }
      }
    });

    this.dataProvider.fetch_data('params', this.country.id, true).then((data: any)=> {
      this.parameters = data.filter((s) => s.type == 2);
    });
  }

}
