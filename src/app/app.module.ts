import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Storage, Drivers } from '@ionic/storage';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { Calendar } from '@awesome-cordova-plugins/calendar/ngx';
import { ImageViewerComponent } from './component/image-viewer/image-viewer.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// import { FCM } from '@ionic-native/fcm/ngx';

import {enableProdMode} from '@angular/core';

enableProdMode();

@NgModule({
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        IonicModule.forRoot({innerHTMLTemplatesEnabled: true}),
        IonicStorageModule.forRoot({
            name: '_cca22125Db',
            driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
        }),
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production
        }),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    declarations: [AppComponent, ImageViewerComponent],
    providers: [InAppBrowser, PhotoViewer, Calendar, SocialSharing, Storage],
    bootstrap: [AppComponent]
})
export class AppModule {}
