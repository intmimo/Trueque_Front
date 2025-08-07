import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: false
})
export class Tab1Page implements OnInit {
  imageBaseUrl = 'http://localhost:8000/storage/'; // Ajusta según tu configuración
  user: any;
  products: any[] = [];
  likes: any[] = [];
  likesRecibidos: any[] = [];
  showLikes: boolean = false;

  private API_URL = 'http://localhost:8000/api';

  constructor(private authService: AuthService, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token guardado.');
      return;
    }

    this.authService.getProfile().subscribe({
      next: (res) => {
        this.user = res.user;
        this.getUserProducts(this.user.id);
        this.cargarMisProductos();
        this.getLikesReceived(this.user.id);
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
      }
    });
  }


  getUserProducts(userId: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`${this.API_URL}/users/${userId}/products`, { headers }).subscribe({
      next: (res) => {
        this.products = res.data;
      },
      error: (err) => {
        console.error('Error al obtener productos:', err);
      }
    });
  }

  cargarMisProductos() {
  this.http.get<any>('http://localhost:8000/api/my-products', {
    headers: this.authService.getAuthHeaders()
  }).subscribe(res => {
    this.products = res.data;
  });
}

  getLikesReceived(userId: number) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<any>(`${this.API_URL}/users/${userId}/liked-by-others`, { headers }).subscribe({
      next: (res) => {
        this.likes = res.data;
        console.log('Likes recibidos:', Response);
      },
      error: (err) => {
        console.error('Error al obtener likes:', err);
      }
    });
  }


  irAPublicar() {
    this.router.navigate(['/product-publi']);
  }
}
