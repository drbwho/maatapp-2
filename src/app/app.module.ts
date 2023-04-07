import { File } from '@awesome-cordova-plugins/file/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { PhotoViewer } from '@awesome-cordova-plugins/photo-viewer/ngx';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { Calendar } from '@awesome-cordova-plugins/calendar/ngx';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { ImageViewerComponent } from './component/image-viewer/image-viewer.component';
// import { FCM } from '@ionic-native/fcm/ngx';

import {enableProdMode} from '@angular/core';
enableProdMode();

@NgModule({
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        IonicModule.forRoot(),
        IonicStorageModule.forRoot(),
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production
        }),
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    ],
    declarations: [AppComponent, ImageViewerComponent],
    providers: [InAppBrowser, PhotoViewer, Network, Calendar, SocialSharing, HTTP, File],
    bootstrap: [AppComponent]
})
export class AppModule {}
