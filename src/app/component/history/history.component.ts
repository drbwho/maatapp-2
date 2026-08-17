import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-history',
    templateUrl: './history.component.html',
    styleUrls: ['./history.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class HistoryComponent implements OnInit {
  @Input() account: any;
  @Input() transactions: any;
  @Input() currencty: string;

  constructor(
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
  }

  dismiss(){
    this.modalCtrl.dismiss();
  }

}
