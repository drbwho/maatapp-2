import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
  standalone: false
})
export class TransactionsComponent  implements OnInit {
  @Input() account: any;
  @Input() meeting: any;

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {

  }

  dismiss(){
    this.modalCtrl.dismiss();
  }
}
