import { Component, Input } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-view',
  templateUrl: './action-view.component.html',
  styleUrls: ['./action-view.component.scss'],
  imports: [IonicModule, CommonModule],
})
export class ActionViewComponent {
  @Input() title: string;
  @Input() image?: string;
  @Input() heading?: string;
  @Input() description?: string;
  @Input() primaryBtn?: any;
  @Input() secondaryBtn?: any;

  constructor(
    private modalCtrl: ModalController
  ){}

  click(action: string){
    this.modalCtrl.dismiss(action);
  }
}
