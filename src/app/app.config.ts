import { provideIonicAngular } from '@ionic/angular/standalone';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, isDevMode, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { IonicStorageModule } from '@ionic/storage-angular';
import { Drivers } from '@ionic/storage';
import { provideServiceWorker } from '@angular/service-worker';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { Calendar } from '@awesome-cordova-plugins/calendar/ngx';
import { routes } from './app.routes';
import { Storage } from '@ionic/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideIonicAngular({ innerHTMLTemplatesEnabled: true }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    importProvidersFrom(
      IonicStorageModule.forRoot({
        storeName: '_castorage',
        name: '_maatdb',
        dbKey: '_cadbkey',
        driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
        description: 'MAAT Storage'
      })
    ),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideHttpClient(withXhr(), withInterceptorsFromDi()),
    provideTranslateService({
      fallbackLang: 'en',
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json'
      })
    }),
    Calendar,
    SocialSharing,
    Storage
  ]
};

