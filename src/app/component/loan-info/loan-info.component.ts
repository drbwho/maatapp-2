import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-loan-info',
    templateUrl: './loan-info.component.html',
    styleUrls: ['./loan-info.component.scss'],
    standalone: false
})
export class LoanInfoComponent  implements OnInit {
  @Input() account: any;
  @Input() country: any;
  @Input() loan_info?: any = {};
  notes: string;
  amount: number;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  ionViewWillEnter(){
    if(this.loan_info){
      if(this.loan_info.notes){
        this.notes = this.loan_info.notes;
      }
      if(this.loan_info.amount){
        this.amount = this.loan_info?.amount;
      }
    }
  }

  dismiss(save = false) {
    if(save){
      this.loan_info.notes = this.notes;
      this.loan_info.amount = this.amount;
      this.modalCtrl.dismiss(this.loan_info);
    }else{
      this.modalCtrl.dismiss();
    }
  }
}
