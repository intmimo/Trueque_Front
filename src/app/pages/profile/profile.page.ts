import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: false,
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

 user = {
    name: 'Armando Islas',
    location: 'Oaxaca, México',
    rating: 4.5,
    photo: '', // Placeholder si está vacío
  };

  products = [
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

  likes = [
    { user: 'Carlos Ruiz', product: 'Audífonos Sony' },
    { user: 'María López', product: 'Teclado Mecánico' },
  ];

  showLikes = false;


  constructor() {}

  ngOnInit() {
    // Aquí luego pondremos la llamada al backend con HttpClient
  }

  toggleLikes() {
    this.showLikes = !this.showLikes;
  }
}
