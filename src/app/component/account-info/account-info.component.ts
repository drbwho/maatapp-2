import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-account-info',
    templateUrl: './account-info.component.html',
    styleUrls: ['./account-info.component.scss'],
    standalone: false
})
export class AccountInfoComponent  implements OnInit {
  @Input() account: any;
  @Input() currency: any;
  @Input() show_transactions: any;
  @Input() group_totals: any;

  loans_expired = false;
  sfloans_expired = false;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    if( this.account.dateecheance != null && (new Date(this.account.dateecheance) < (new Date()))){
      this.loans_expired = true;
    }
    if( this.account.sfdateecheance != null && (new Date(this.account.sfdateecheance) < (new Date()))){
      this.sfloans_expired = true;
    }
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
