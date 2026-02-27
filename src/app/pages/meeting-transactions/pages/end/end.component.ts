import { Component, OnInit, Input } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ConfigData } from '../../../../providers/config-data';

@Component({
  selector: 'app-end',
  templateUrl: './end.component.html',
  styleUrls: ['./end.component.scss'],
  standalone: false
})
export class EndComponent  implements OnInit {
  @Input() group: any;
  @Input() accounts: any;
  @Input() country: any;
  @Input() meeting: any;
  loans_completed = 0;
  loans_to_due = 0;

  constructor(
    private storage: Storage,
    private config: ConfigData
  ) { }

  ngOnInit() {
    this.calc_views();
  }

  calc_views(){
    let param  = this.country.parameters.find(p => p.code == 'REM');
    const today = new Date();
    this.storage.get(this.config.TRANSACTIONS_FILE).then((trns)=>{
      if(trns && (trns.filter(s => s.idmeeting == this.meeting.id)).length){
        this.accounts.forEach(acc => {
          // cals loans completed
          let reimbursement = trns.find(tr => tr.idparameter == param.id && tr.idaccount == acc.id);
          if(reimbursement && parseFloat(reimbursement.amount) == parseFloat(acc.restearembourser)){
            this.loans_completed++;
          }

          //calc loans dues
          const givenDate = new Date(acc.dateecheance);
          const diffInMs = givenDate.getTime() - today.getTime();
          const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
          if(diffInDays < 7){
            this.loans_to_due++;
          }
        })
       };
    })

  }

}
