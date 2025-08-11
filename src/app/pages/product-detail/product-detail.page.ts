import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Share } from '@capacitor/share';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';

import { ChatService } from 'src/app/services/chat.service';
import { ProductService } from 'src/app/services/product.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './product-detail.page.html',
  standalone: false,
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {

  slideOpts = { initialSlide: 0, speed: 400, loop: true };

  product: any;
  isLiked = false;
  likesCount = 0;
  isMyProduct = false;
  currentUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private chat_service: ChatService,
    private product_service: ProductService,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadProductDetail();
  }

  private loadCurrentUser() {
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.currentUserId = res.user?.id ?? null;
        this.checkIfMyProduct();
      },
      error: (err) => console.error('Error al cargar perfil del usuario:', err)
    });
  }

  private loadProductDetail() {
    const productId = Number(this.route.snapshot.paramMap.get('id')!);
    this.product_service.getProductById(productId).subscribe({
      next: (response) => {
        this.product = response.data;

        this.isLiked    = this.product?.is_liked_by_user || false;
        this.likesCount = this.product?.total_likes || 0;

        this.product.images = Array.isArray(this.product.images)
          ? this.product.images.map((img: any) => ({
              ...img,
              image_url: `http://localhost:8000/storage/${img.image_path}`
            }))
          : [];

        this.checkIfMyProduct();
      },
      error: (err) => console.error('Error al cargar detalle del producto:', err)
    });
  }

  private checkIfMyProduct() {
    if (this.currentUserId && this.product?.user?.id) {
      this.isMyProduct = this.currentUserId === this.product.user.id;
    }
  }

  chat() {
    if (!this.product?.user?.id) return;
    this.chat_service.startChat(this.product.user.id).subscribe({
      next: (res: any) => {
        this.router.navigate(['/tabs/tab3/chat-detail'], {
          queryParams: { chatId: res.chat_id, name: this.product.user.name }
        });
      },
      error: (err) => console.error('Error al iniciar chat:', err)
    });
  }

  async shareProduct() {
    await Share.share({
      title: this.product?.name,
      text: `Mira este producto: ${this.product?.name} - ${this.product?.description}`,
      url: window.location.href,
      dialogTitle: 'Compartir producto'
    });
  }

  toggleLike() {
    if (!this.product?.id) return;

    if (this.isLiked) {
      this.product_service.unlikeProduct(this.product.id).subscribe({
        next: (res) => {
          this.isLiked = false;
          this.likesCount = res.product?.total_likes ?? Math.max(0, this.likesCount - 1);
        },
        error: (err) => console.error('Error al quitar like:', err)
      });
    } else {
      this.product_service.likeProduct(this.product.id).subscribe({
        next: (res) => {
          this.isLiked = true;
          this.likesCount = res.product?.total_likes ?? (this.likesCount + 1);
        },
        error: (err) => {
          if (err.status === 400 && err.error?.message?.includes('Ya has dado like')) {
            this.isLiked = true;
          } else {
            console.error('Error al dar like:', err);
          }
        }
      });
    }
  }

  // === EDITAR ===
  editProduct() {
    this.router.navigate(['/product-publi'], {
      state: { mode: 'edit', product: this.product }
    });
  }

  // === ELIMINAR ===
  async deleteProduct() {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar producto',
      message: 'Esta acción no se puede deshacer. ¿Deseas continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingCtrl.create({ message: 'Eliminando...' });
            await loading.present();

            this.product_service.deleteProduct(this.product.id).subscribe({
              next: async () => {
                await loading.dismiss();
                await this.toast('Producto eliminado', 'success');
                this.router.navigate(['/tabs/tab2']);
              },
              error: async (err) => {
                await loading.dismiss();
                console.error('Error al eliminar:', err);
                await this.toast('No se pudo eliminar el producto', 'danger');
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  private async toast(message: string, color: string = 'primary') {
    const t = await this.toastCtrl.create({ message, color, duration: 1800, position: 'bottom' });
    await t.present();
  }
}
