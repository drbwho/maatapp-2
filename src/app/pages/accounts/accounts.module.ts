import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccountsPageRoutingModule } from './accounts-routing.module';

import { AccountsPage } from './accounts.page';

// needed fot translate pipe activation
import { TranslatePipe } from '@ngx-translate/core';
import { AutoFitTextModule } from '../../directives/auto-fit-text.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AccountsPageRoutingModule,
    TranslatePipe,
    AutoFitTextModule
  ],
  declarations: [AccountsPage]
})
export class AccountsPageModule {}
