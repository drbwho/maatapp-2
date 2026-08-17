import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';

// needed fot translate pipe activation
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-action-view',
  templateUrl: './action-view.component.html',
  styleUrls: ['./action-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonicModule, CommonModule, TranslatePipe]
})
export class ActionViewComponent {
  @Input() title?: string;
  @Input() alttitle?: string;
  @Input() subtitle?: string;
  @Input() image?: string;
  @Input() heading?: string;
  @Input() description?: string;
  @Input() information?: string;
  @Input() subinformation?: string;
  @Input() badge?: any;
  @Input() hasBackButton? = false;
  @Input() buttons?: any;

  constructor(
    private modalCtrl: ModalController
  ){}

  click(action: string){
    this.modalCtrl.dismiss(action);
  }
}
