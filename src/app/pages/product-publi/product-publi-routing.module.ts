import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProductPubliPage } from './product-publi.page';

const routes: Routes = [
  {
    path: '',
    component: ProductPubliPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProductPubliPageRoutingModule {}
