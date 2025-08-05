import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { register } from 'swiper/element/bundle';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));

  //REGISTRAR SWIPER
  register();
