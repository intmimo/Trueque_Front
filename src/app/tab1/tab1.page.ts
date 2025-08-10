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

  // Carga inicial (primera vez que se monta el componente)
  ngOnInit() {
    this.refreshAll();
  }

  // Se ejecuta SIEMPRE que esta vista vuelve a activarse (por ejemplo, al regresar de editar perfil)
  ionViewWillEnter() {
    this.refreshAll();
  }

  /** Orquestador: pide perfil, productos y ratings */
  private refreshAll() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No hay token guardado.');
      return;
    }

    this.authService.getProfile().subscribe({
      next: (res) => {
        this.user = res.user; // { user: {...} } en tu backend
        if (this.user?.id) {
          this.getUserProducts(this.user.id);
          this.cargarMisProductos();
          this.getLikesReceived(this.user.id);
          this.loadRatings(this.user.id);
        }
      },
      error: (err) => console.error('Error al cargar perfil:', err)
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
      console.log('Respuesta ratings:', res);

      this.ratingAvg = Number(res.average_rating) || 0;
      this.ratingCount = Number(res.rating_count) || 0;

      this.ratings = []; // No hay lista de ratings en esta respuesta
    },
    error: (err) => console.error('Error al cargar ratings:', err)
  });
}



  // Utilidad para pintar 5 estrellas
  get stars(): number[] {
    return [1, 2, 3, 4, 5];
  }
  isFilledStar(index: number): boolean {
    return index <= Math.round(this.ratingAvg);
  }

  // Navegar a publicar
  irAPublicar() {
    this.router.navigate(['/product-publi']);
  }

  // Navegar a editar perfil
  irAEditarPerfil() {
    this.router.navigate(['/profile-edit']);
  }

  get starsWithIndex() {
  return this.stars.map((_, i) => ({ index: i }));
}

logout() {
    this.authService.logout().subscribe({
      next: () => {
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Error al cerrar sesión', err);
        // Puedes mostrar mensaje de error o forzar logout local igual
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
  }
}
