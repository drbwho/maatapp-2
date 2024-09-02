import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-account-info',
  templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.scss'],
})
export class AccountInfoComponent  implements OnInit {
  @Input() account: any;
  @Input() currency: any;
  @Input() show_transactions: any;
  @Input() group_totals: any;

  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}

  dismiss() {
    this.modalCtrl.dismiss();
  }
}
