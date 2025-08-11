import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Share } from '@capacitor/share';
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

  slideOpts = {
    initialSlide: 0,
    speed: 400,
    loop: true
  };

  product: any;
  isLiked = false;
  likesCount = 0;
  isMyProduct = false; // Nueva propiedad para determinar si es mi producto
  currentUserId: number | null = null; // ID del usuario actual

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private chat_service: ChatService,
    private product_service: ProductService,
    private authService: AuthService // Agregamos AuthService
  ) { }

  ngOnInit() {
    this.loadCurrentUser();
    this.loadProductDetail();
  }

  private loadCurrentUser() {
    // Obtener información del usuario actual
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.currentUserId = res.user?.id;
        this.checkIfMyProduct(); // Verificar propiedad después de cargar usuario
      },
      error: (err) => {
        console.error('Error al cargar perfil del usuario:', err);
      }
    });
  }
private loadProductDetail() {
  const productId = this.route.snapshot.paramMap.get('id')!;
  this.product_service.getProductById(+productId).subscribe({
    next: (response) => {
      console.log('Respuesta completa:', response);

      // El producto está directamente en response.data, no en response.data.product
      this.product = response.data; // ← Cambio aquí

      // Buscar estas propiedades en el nivel correcto
      this.isLiked = response.data.is_liked_by_user || false;
      this.likesCount = response.data.total_likes || 0;

      // Procesar imágenes de forma segura
      if (this.product.images && Array.isArray(this.product.images)) {
        this.product.images = this.product.images.map((img: any) => ({
          ...img,
          image_url: `http://localhost:8000/storage/${img.image_path}`
        }));
      } else {
        this.product.images = [];
      }

      this.checkIfMyProduct();
      console.log('Producto cargado:', this.product);
    },
    error: (err) => {
      console.error('Error al cargar detalle del producto:', err);
    }
  });
}

  private checkIfMyProduct() {
    // Verificar si el producto pertenece al usuario actual
    if (this.currentUserId && this.product?.user?.id) {
      this.isMyProduct = this.currentUserId === this.product.user.id;
    }
  }

  chat() {
    if (!this.product?.user?.id) {
      console.error('No se encontró el usuario del producto');
      return;
    }
    this.chat_service.startChat(this.product.user.id).subscribe({
      next: (res: any) => {
        // Navegar a la página del chat enviando chatId y nombre
        this.router.navigate(['/tabs/tab3/chat-detail'], {
          queryParams: {
            chatId: res.chat_id,
            name: this.product.user.name
          }
        });
      },
      error: (err) => {
        console.error('Error al iniciar chat:', err);
      }
    });
  }

  async shareProduct() {
    await Share.share({
      title: this.product.name,
      text: `Mira este producto: ${this.product.name} - ${this.product.description}`,
      url: window.location.href,
      dialogTitle: 'Compartir producto'
    });
  }

  toggleLike() {
    if (!this.product?.id) return;

    if (this.isLiked) {
      // Quitar like
      this.product_service.unlikeProduct(this.product.id).subscribe({
        next: (res) => {
          this.isLiked = false;
          this.likesCount = res.product?.total_likes ?? (this.likesCount > 0 ? this.likesCount - 1 : 0);
        },
        error: (err) => console.error('Error al quitar like:', err)
      });
    } else {
      // Dar like
      this.product_service.likeProduct(this.product.id).subscribe({
        next: (res) => {
          this.isLiked = true;
          this.likesCount = res.product?.total_likes ?? this.likesCount + 1;
        },
        error: (err) => {
          // Si ya diste like (error 400), solo actualizamos estado sin lanzar error
          if (err.status === 400 && err.error?.message?.includes('Ya has dado like')) {
            console.warn('Ya habías dado like, ajustando estado local.');
            this.isLiked = true;
          } else {
            console.error('Error al dar like:', err);
          }
        }
      });
    }
  }

  // Método para editar producto (placeholder)
  editProduct() {
    console.log('Editando producto:', this.product.id);
    // TODO: Implementar navegación a página de edición
    // this.router.navigate(['/product-edit', this.product.id]);
  }

  // Método para eliminar producto (placeholder)
  deleteProduct() {
    console.log('Eliminando producto:', this.product.id);
    // TODO: Implementar confirmación y eliminación
    // Swal.fire para confirmar eliminación
  }

}
