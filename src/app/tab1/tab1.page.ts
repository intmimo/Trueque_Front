import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { RatingService } from '../services/rating.service';
import Swal from 'sweetalert2';

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
  likedProducts: any[] = [];

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
          this.loadRatings(this.user.id);
          this.loadRatingHistory(this.user.id);
          this.loadLikedProducts(this.user.id);
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

  // Obtener URL de la foto de perfil del usuario actual
  getProfilePhotoUrl(): string {

    // Prioridad 1: Si el backend ya devuelve la URL completa
    if (this.user?.profile_photo_url) {
      // El backend ya devuelve la URL completa, pero puede que falte el dominio
      let photoUrl = this.user.profile_photo_url;

      // Si la URL es relativa (/storage/...), agregar el dominio
      if (photoUrl.startsWith('/storage/')) {
        photoUrl = 'http://localhost:8000' + photoUrl;
      }

      return photoUrl;
    }

    // Prioridad 2: Si tiene el path relativo
    if (this.user?.profile_photo) {
      const photoUrl = this.imageBaseUrl + this.user.profile_photo;
      console.log('✅ URL de foto generada:', photoUrl); // DEBUG
      return photoUrl;
    }

    // Fallback: avatar generado
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.user?.name || 'User')}&background=0ea5e9&color=fff&size=128`;
    console.log('⭐ Usando avatar generado:', avatarUrl); // DEBUG
    return avatarUrl;
  }

  // Obtener URL de foto para calificadores
  getRaterPhotoUrl(rater: any): string {
    // Prioridad 1: URL completa del backend
    if (rater?.profile_photo_url) {
      let photoUrl = rater.profile_photo_url;
      if (photoUrl.startsWith('/storage/')) {
        photoUrl = 'http://localhost:8000' + photoUrl;
      }
      return photoUrl;
    }

    // Prioridad 2: Path relativo
    if (rater?.profile_photo) {
      return this.imageBaseUrl + rater.profile_photo;
    }

    // Fallback: avatar generado
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(rater?.name || 'User')}&background=9ca3af&color=fff&size=64`;
  }

  // Manejar error de imagen (fallback)
  onImageError(event: any) {
    // Si falla cargar la imagen de perfil, usar avatar generado
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.user?.name || 'User')}&background=0ea5e9&color=fff&size=128`;
    event.target.src = fallbackUrl;
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

  //funcion de cerrar sesion
  logout() {
    Swal.fire({
      title: '¿Quieres cerrar sesión?',
      text: 'Se cerrará tu sesión actual',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#38bdf8',
      backdrop: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
      heightAuto: false,
      customClass: {
        container: 'custom-swal-container'
      },
      didOpen: () => {
        this.fixSwalContainer();
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.logout().subscribe({
          next: () => {
            localStorage.removeItem('token');
            Swal.fire({
              icon: 'success',
              title: 'Sesión cerrada',
              text: 'Has cerrado sesión correctamente.',
              confirmButtonText: 'OK',
              confirmButtonColor: '#38bdf8',
              backdrop: true,
              allowOutsideClick: false,
              allowEscapeKey: false,
              heightAuto: false,
              customClass: {
                container: 'custom-swal-container'
              },
              didOpen: () => {
                this.fixSwalContainer();
              }
            }).then(() => {
              this.router.navigate(['/login']);
            });
          },
          error: (err) => {
            console.error('Error al cerrar sesión', err);
            localStorage.removeItem('token');
            Swal.fire({
              icon: 'warning',
              title: 'Sesión cerrada localmente',
              text: 'No se pudo cerrar sesión en el servidor, pero tu sesión local ha sido finalizada.',
              confirmButtonText: 'OK',
              confirmButtonColor: '#f59e0b',
              backdrop: true,
              allowOutsideClick: true,
              allowEscapeKey: true,
              heightAuto: false,
              customClass: {
                container: 'custom-swal-container'
              },
              didOpen: () => {
                this.fixSwalContainer();
              }
            }).then(() => {
              this.router.navigate(['/login']);
            });
          }
        });
      }
    });
  }

  //helper para la alerta
  private fixSwalContainer() {
    const container = document.querySelector('.swal2-container');
    if (container) {
      (container as HTMLElement).style.height = '100vh';
      (container as HTMLElement).style.width = '100vw';
    }
  }

  // ⭐ Cargar historial completo de calificaciones
loadRatingHistory(userId: number) {
  this.ratingService.getUserRatingHistory(userId).subscribe({
    next: (res) => {
      console.log('Historial de ratings:', res);
      this.ratings = res.ratings;  // Aquí sí hay lista de calificaciones
    },
    error: (err) => console.error('Error al cargar historial de ratings:', err)
  });
}

loadLikedProducts(userId: number) {
  this.http.get<any>(`${this.API_URL}/user/${userId}/liked-products`, { headers: this.getAuthHeaders() })
    .subscribe({
      next: (res) => {
        this.likedProducts = res.data || [];
        console.log('Productos liked:', this.likedProducts);
      },
      error: (err) => console.error('Error al obtener productos liked:', err)
    });
}

  // Navegar al detalle del producto
  goToProductDetail(productId: number) {
    this.router.navigate(['/product-detail', productId]);
  }
}
