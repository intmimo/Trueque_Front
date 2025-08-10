import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePublicPageRoutingModule } from './profile-public-routing.module';

import { ProfilePublicPage } from './profile-public.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePublicPageRoutingModule
  ],
  declarations: [ProfilePublicPage]
})
export class ProfilePublicPageModule {}
