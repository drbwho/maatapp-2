import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

// needed fot translate pipe activation
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-account-info',
    templateUrl: './account-info.component.html',
    styleUrls: ['./account-info.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IonicModule, CommonModule, TranslatePipe]
})
export class AccountInfoComponent  implements OnInit {
  @Input() account: any;
  @Input() country: any;

  show_details = false;
  loans_expired = false;
  sfloans_expired = false;
  public pf = parseFloat;

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
