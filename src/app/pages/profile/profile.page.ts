import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  usuario: any = {
    name: '',
    location: '',
    rating: 4.5,
    photo: ''
  };

  products: any[] = [];
  likes: any[] = [];
  showLikes = false;

  constructor(
    private storage: Storage,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.storage.create();

    const usuario = await this.storage.get('usuario');
    if (usuario) {
      this.usuario.name = usuario.name;
      this.usuario.location = `${usuario.colonia}, ${usuario.municipio}`;
      this.usuario.photo = usuario.photo || '';
    }

    // Aquí puedes traer productos y likes del backend si ya están conectados
    this.products = [
      {
        name: 'Audífonos Sony',
        image: 'https://via.placeholder.com/300x200',
        status: 'Disponible'
      },
      {
        name: 'Teclado Mecánico',
        image: 'https://via.placeholder.com/300x200',
        status: 'Intercambiado'
      },
    ];

    this.likes = [
      { user: 'Carlos Ruiz', product: 'Audífonos Sony' },
      { user: 'María López', product: 'Teclado Mecánico' },
    ];
  }

  toggleLikes() {
    this.showLikes = !this.showLikes;
  }

  async logout() {
    await this.storage.remove('token');
    await this.storage.remove('usuario');
    this.router.navigate(['/login']);
  }
}
