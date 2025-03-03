import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Storage, Drivers } from '@ionic/storage';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { Calendar } from '@awesome-cordova-plugins/calendar/ngx';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import {enableProdMode} from '@angular/core';

enableProdMode();

@NgModule({ schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [AppComponent],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        IonicModule.forRoot({ innerHTMLTemplatesEnabled: true }),
        IonicStorageModule.forRoot({
            storeName: '_castorage',
            name: '_maatdb',
            dbKey: '_cadbkey',
            driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
            description: 'MAAT Storage'
        }),
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production
        })], providers: [Calendar, SocialSharing, Storage, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule {}
 