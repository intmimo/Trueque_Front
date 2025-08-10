import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfilePublicService } from 'src/app/services/profile-public.service';
import { RatingService } from 'src/app/services/rating.service';
import { ToastController } from '@ionic/angular';

interface UserPublic {
  id: number;
  name: string;
  email?: string;
  colonia?: string;
  municipio?: string;
  rating?: number;
  full_location?: string;
  days_in_app?: number;
  created_at?: string;
  updated_at?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  images?: { image_path: string }[];
}

@Component({
  selector: 'app-profile-public',
  templateUrl: './profile-public.page.html',
  standalone: false,
  styleUrls: ['./profile-public.page.scss'],
})
export class ProfilePublicPage implements OnInit {

  userId!: number;
  user?: UserPublic;
  products: Product[] = [];

  // Props para el sistema de calificación
  averageRating: number = 0;
  totalRatings: number = 0;
  selectedStars: number = 0;
  isSubmitting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private profilePublicService: ProfilePublicService,
    private ratingService: RatingService,
    private toastCtrl: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.userId = Number(id);
        this.loadUser();
        this.loadUserProducts();
        this.loadRatingSummary();
      }
    });
  }

  loadUser() {
    this.profilePublicService.getUserById(this.userId).subscribe({
      next: (res: any) => {
        this.user = res.user || res.data || res;
      },
      error: (err: any) => {
        console.error('Error al cargar usuario público:', err);
        this.showToast('Error al cargar el perfil del usuario', 'danger');
      }
    });
  }

  loadUserProducts() {
    this.profilePublicService.getUserProducts(this.userId).subscribe({
      next: (res: any) => {
        this.products = res.data || res.products || [];
      },
      error: (err: any) => {
        console.error('Error al cargar productos del usuario:', err);
        this.showToast('Error al cargar los productos', 'danger');
      }
    });
  }

  verDetalle(id: number) {
    this.router.navigate(['/product-detail', id]);
  }

  onImageError(event: any) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'assets/images/placeholder.png';
    }
  }

  // === Métodos para rating ===
loadRatingSummary() {
  this.ratingService.getUserRatingSummary(this.userId).subscribe({
    next: (res: any) => {
      this.averageRating = res.average_rating || 0;
      this.totalRatings = res.rating_count || 0;
    },
    error: (err: any) => {
      console.error('Error al cargar rating:', err);
      // No mostrar toast de error para el rating, es opcional
    }
  });
}

  setStars(value: number) {
    this.selectedStars = value;
  }

  submitRating() {
    if (this.selectedStars < 1) {
      this.showToast('Selecciona al menos 1 estrella', 'warning');
      return;
    }

    this.isSubmitting = true;
    this.ratingService.rateUser(this.userId, this.selectedStars).subscribe({
      next: (res: any) => {
        this.showToast('Calificación enviada exitosamente', 'success');
        this.loadRatingSummary(); // Actualizar el promedio
        this.selectedStars = 0;   // Resetear selección
        this.isSubmitting = false;
      },
      error: (err: any) => {
        console.error('Error al enviar calificación:', err);

        // Manejar diferentes tipos de errores
        if (err.status === 401) {
          this.showToast('Debes iniciar sesión para calificar', 'warning');
        } else if (err.status === 422) {
          this.showToast('Ya has calificado a este usuario', 'warning');
        } else {
          this.showToast('Error al enviar calificación', 'danger');
        }

        this.isSubmitting = false;
      }
    });
  }

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastCtrl.create({
      message,
      color,
      duration: 2000,
      position: 'bottom'
    });
    await toast.present();
  }
}
