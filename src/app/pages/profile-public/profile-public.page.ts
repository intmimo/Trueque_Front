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
  profile_photo_url?: string;
  profile_photo?: string;
  avatar?: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  user?: UserPublic;
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

  averageRating: number = 0;
  totalRatings: number = 0; // tu back actual no lo devuelve; quedará en 0
  selectedStars: number = 0;
  isSubmitting: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private profilePublicService: ProfilePublicService,
    private ratingService: RatingService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  ngOnInit(): void {
    const stateUser =
      (this.router.getCurrentNavigation()?.extras?.state as any)?.user ||
      (history.state && (history.state as any).user);

    if (stateUser?.id) {
      this.user = stateUser as UserPublic;
      this.userId = this.user.id;
      this.loadUserProducts();
      this.loadRatingSummary();
      return;
    }

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.userId = Number(id);
        this.loadUserProducts(true); // derivar user desde products[0].user
        this.loadRatingSummary();
      }
    });
  }

  loadUserProducts(deriveUserFromProducts: boolean = false): void {
    this.profilePublicService.getUserProducts(this.userId).subscribe({
      next: (res: any) => {
        this.products = res.data || res.products || [];
        if (deriveUserFromProducts && !this.user) {
          const firstUser = this.products?.[0]?.user;
          if (firstUser?.id) this.user = firstUser;
        }
      },
      error: (err: any) => {
        console.error('Error al cargar productos del usuario:', err);
        this.showToast('Error al cargar los productos', 'danger');
      }
    });
  }

  loadRatingSummary(): void {
    this.ratingService.getUserRatingSummary(this.userId).subscribe({
      next: (res: any) => {
        this.averageRating = res?.average_rating || 0;
        this.totalRatings = res?.rating_count || 0; // tu endpoint no lo trae aún
      },
      error: (err: any) => {
        console.error('Error al cargar rating:', err);
      }
    });
  }

  setStars(value: number): void {
    this.selectedStars = value;
  }

  submitRating(): void {
    if (this.selectedStars < 1) {
      this.showToast('Selecciona al menos 1 estrella', 'warning');
      return;
    }

    // Evitar 400 por auto-calificación
    const me = JSON.parse(localStorage.getItem('user') || '{}');
    if (me?.id === this.userId) {
      this.showToast('No puedes calificarte a ti mismo', 'warning');
      return;
    }

    this.isSubmitting = true;
    this.ratingService.rateUser(this.userId, this.selectedStars).subscribe({
      next: () => {
        this.showToast('Calificación enviada exitosamente', 'success');
        this.loadRatingSummary();
        this.selectedStars = 0;
        this.isSubmitting = false;
      },
      error: (err: any) => {
        console.error('Error al enviar calificación:', err);

        const msg =
          err?.error?.message ||
          err?.error?.errors?.stars?.[0] ||
          (err.status === 401
            ? 'Debes iniciar sesión para calificar'
            : 'Error al enviar calificación');

        this.showToast(msg, err.status === 401 ? 'warning' : 'danger');
        this.isSubmitting = false;
      }
    });
  }

  verDetalle(id: number): void {
    this.router.navigate(['/product-detail', id]);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = 'https://via.placeholder.com/300x200?text=Sin+imagen';
    }
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
