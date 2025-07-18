import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProductPubliPageRoutingModule } from './product-publi-routing.module';

import { ProductPubliPage } from './product-publi.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProductPubliPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [ProductPubliPage]
})
export class ProductPubliPageModule {}
