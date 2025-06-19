import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-loan-info',
    templateUrl: './loan-info.component.html',
    styleUrls: ['./loan-info.component.scss'],
    standalone: false
})
export class LoanInfoComponent  implements OnInit {
  @Input() group: any;
  @Input() loan_info: any;
  categories: any = null;
  quantity={};
  notes: string;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}
  
  ionViewWillEnter(){
    if(this.group.loancategories){
      this.categories = this.group.loancategories;
    }
    if(this.loan_info.categories){
      this.loan_info.categories = JSON.parse(this.loan_info.categories);
      Object.entries(this.loan_info.categories).forEach(
        ([key, value]) => {
          this.quantity[key]=value;
        });
    }
    if(this.loan_info.notes){
      this.notes = this.loan_info.notes;
    }
  }

  dismiss() {
    this.loan_info.categories=JSON.stringify(this.quantity);
    this.loan_info.notes=this.notes;
    this.modalCtrl.dismiss(this.loan_info);
  }
}
