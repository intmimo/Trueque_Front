import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// 📌 IMPORTA TU MODAL
import { RateUserModalComponent } from './components/rate-user-modal/rate-user-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    RateUserModalComponent // 📌 DECLARAR EL MODAL
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    FormsModule,      // 📌 NECESARIO PARA [(ngModel)]
    CommonModule      // 📌 NECESARIO PARA directivas *ngIf, *ngFor, etc.
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent], // 📌 PERMITE USAR <ion-header>, etc.
})
export class AppModule {}
