import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { RatingService } from '../services/rating.service';

@Component({
  selector: 'app-tab1',
  templateUrl: './tab1.page.html',
  styleUrls: ['./tab1.page.scss'],
  standalone: false
})
export class Tab1Page implements OnInit {
  imageBaseUrl = 'http://localhost:8000/storage/';
  private API_URL = 'http://localhost:8000/api';

  user: any;
  products: any[] = [];
  likes: any[] = [];           // si lo usas
  likesRecibidos: any[] = [];  // si lo usas
  showLikes: boolean = false;

  // ⭐ Rating
  ratingAvg = 0;
  ratingCount = 0;
  ratings: any[] = []; // lista de calificaciones recibidas (con rater, value, comment...)

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private ratingService: RatingService
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token guardado.');
      return;
    }

    this.authService.getProfile().subscribe({
      next: (res) => {
        // el backend devuelve { user: {...} }
        this.user = res.user;
        this.getUserProducts(this.user.id);
        this.cargarMisProductos();
        this.getLikesReceived(this.user.id);
        this.loadRatings(this.user.id); // 👈 cargar rating promedio + lista
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
      }
    });
  }

  /** Headers locales simples */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // Productos del usuario (público)
  getUserProducts(userId: number) {
    this.http.get<any>(`${this.API_URL}/users/${userId}/products`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (res) => {
          this.products = res.data || res.products || [];
        },
        error: (err) => console.error('Error al obtener productos:', err)
      });
  }

  // Mis productos (autenticado)
  cargarMisProductos() {
    this.http.get<any>(`${this.API_URL}/my-products`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (res) => {
          this.products = res.data || res.products || [];
        },
        error: (err) => console.error('Error al obtener mis productos:', err)
      });
  }

  // Likes recibidos (si ya lo usas)
  getLikesReceived(userId: number) {
    this.http.get<any>(`${this.API_URL}/users/${userId}/liked-by-others`, { headers: this.getAuthHeaders() })
      .subscribe({
        next: (res) => {
          // depende de cómo lo devuelva tu backend:
          this.likes = res.likes_received || res.data || [];
        },
        error: (err) => console.error('Error al obtener likes:', err)
      });
  }

  // ⭐ Cargar ratings (promedio + lista)
  loadRatings(userId: number) {
    this.ratingService.getUserRatings(userId).subscribe({
      next: (res) => {
        // Tolerante a distintas estructuras de respuesta:
        const avg = res.average ?? res.data?.average ?? res.summary?.average ?? 0;
        const total = res.total ?? res.count ?? res.data?.total ?? res.summary?.count ?? 0;
        const items = res.ratings ?? res.data?.ratings ?? res.data ?? [];

        this.ratingAvg = Number(avg) || 0;
        this.ratingCount = Number(total) || 0;
        this.ratings = Array.isArray(items) ? items : [];

        // Normalizamos cada rating
        this.ratings = this.ratings.map((r: any) => ({
          id: r.id,
          value: Number(r.value ?? r.stars ?? r.score ?? 0),
          comment: r.comment ?? '',
          created_at: r.created_at ?? r.date ?? '',
          rater: r.rater ?? r.user ?? r.author ?? null // quien calificó
        }));
      },
      error: (err) => console.error('Error al cargar ratings:', err)
    });
  }



  // Utilidad para pintar 5 estrellas
  get stars(): number[] {
    return [1, 2, 3, 4, 5];
  }
  isFilledStar(index: number): boolean {
    // si ratingAvg = 4.2 => se llenan 4
    return index <= Math.round(this.ratingAvg);
  }

  // Navegar a publicar
  irAPublicar() {
    this.router.navigate(['/product-publi']);
  }
}
