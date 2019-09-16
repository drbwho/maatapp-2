import { FileOpener } from '@ionic-native/file-opener/ngx';
import { File } from '@ionic-native/file/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { Network } from '@ionic-native/network/ngx';
import { Calendar } from '@ionic-native/calendar/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { ImageViewerComponent } from './component/image-viewer/image-viewer.component';

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
  entryComponents: [ImageViewerComponent],
  providers: [InAppBrowser, SplashScreen, StatusBar, PhotoViewer, Network, Calendar, SocialSharing, HTTP, File, FileOpener],
  bootstrap: [AppComponent]
})
export class AppModule {}
