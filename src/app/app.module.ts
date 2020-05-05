import { AuthService } from './services/auth.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, PreloadAllModules } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ROUTES } from './app.routes';
import { AppComponent } from './app.component';
import { AppConfig } from './app.config';
import { ErrorComponent } from './error/error.component';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireFunctionsModule } from '@angular/fire/functions';

import { ToastModule } from 'primeng/toast';
import {GrowlModule} from 'primeng/growl';
import { MessageService } from 'primeng/components/common/messageservice';
import { AuthguardService } from './services/authguard.service';
import { ConfirmationService } from 'primeng/api';
import { OrderService } from './services/order.service';
import { MomentModule } from 'ngx-moment';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import {NgxMaskModule} from 'ngx-mask';
import { HttpModule } from '@angular/http';
import { RoleguardService } from './services/roleguard.service';
import { DisableControlModule } from './interfaces/disableControl/disableControl.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { ScrollableDirective } from './interfaces/scrollable/scrollable.directive';

const APP_PROVIDERS = [
  AppConfig
];
const firebase = {
  apiKey: 'AIzaSyBbzTuUJrPyAOP6EitTndDqgZci9AlazN4',
  authDomain: 'coffessions-server.firebaseapp.com',
  databaseURL: 'https://coffessions-server.firebaseio.com',
  projectId: 'coffessions-server',
  storageBucket: 'coffessions-server.appspot.com',
  messagingSenderId: '615318561680'
};
@NgModule({
  bootstrap: [ AppComponent ],
  declarations: [
    AppComponent,
    ErrorComponent,
    ScrollableDirective,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    RouterModule.forRoot(ROUTES, {
      useHash: true,
      preloadingStrategy: PreloadAllModules
    }),
    AngularFireModule.initializeApp(firebase),

    AngularFirestoreModule, // imports firebase/firestore, only needed for database features
    AngularFirestoreModule,
    AngularFireAuthModule, // imports firebase/auth, only needed for auth features,
    ReactiveFormsModule,
    AngularFireStorageModule,
    ToastModule,
    GrowlModule,
    MomentModule,
    LoggerModule.forRoot({serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.DEBUG, serverLogLevel: NgxLoggerLevel.ERROR}),
    AngularFireFunctionsModule,
    HttpModule,
    DisableControlModule,
TooltipModule.forRoot(),
ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),

  ],
  providers: [
    APP_PROVIDERS,
    MessageService,
    AuthService,
    AuthguardService,
    ConfirmationService, OrderService,
    RoleguardService
  ]
})
export class AppModule {}
