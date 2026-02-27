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
  details:any = {};
  show_details = false;

  constructor(
    private dataProvider: DataProvider,
    private operTools: OperationTools,
    private storage: Storage,
    private config: ConfigData
  ) { }

  async ngOnInit() {
    this.numberofmembers = this.group.numberofmembers;
    this.accounts = this.accounts.filter(m => m.isPresent);
    this.attendance = this.accounts.length;
    this.tr_icons = this.operTools.tr_icons;
    
    this.current_maats = this.group.account.restearembourser - this.group.totals.loans + this.group.totals.reimbursements;
      
    let paramloan = this.country.parameters.find(p => p.code == 'EMP');
    let paramrem = this.country.parameters.find(p => p.code == 'REM');
    let paramsfloan = this.country.parameters.find(p => p.code == 'SFEMP');
    let paramsfrem = this.country.parameters.find(p => p.code == 'SFREM');
    let paramfcp = this.country.parameters.find(p => p.code == 'AST');
    this.details = {loan: 0.00, rem: 0.00, sfloan: 0.00, sfrem: 0.00, fcp: 0.00};
    
    this.storage.get(this.config.TRANSACTIONS_FILE).then((trns)=>{
      let membertransactions = trns.filter(s => s.idaccount != this.group.account.id && s.idmeeting == this.meeting.id)
      if(membertransactions){
        // review totals
        membertransactions.forEach(tr => {
          switch(tr.idparameter){
            case(paramloan.id):
              this.details.loan++;
              break;
            case(paramrem.id):
              this.details.rem++;
              break;
            case(paramsfloan.id):
              this.details.sfloan++;
              break;
            case(paramsfrem.id):
              this.details.sfrem++;
              break;
            case(paramfcp.id):
              this.details.fcp++;
              break;            
          }
        });

        // Group Transactions
        let transactions = trns.filter((s)=>s.idaccount == this.group.account.id && s.idmeeting == this.meeting.id);
        if(transactions){
          transactions.forEach((tr)=>{
            this.amount[tr.idparameter] = tr.amount;
          })
        }
      }
    });

    this.parameters = this.country.parameters.filter((s) => s.type == 2);
  }

}
