import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

// needed fot translate pipe activation
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader();
}
@Component({
    selector: 'app-account-info',
    templateUrl: './account-info.component.html',
    styleUrls: ['./account-info.component.scss'],
    imports: [IonicModule, CommonModule, TranslateModule]
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
