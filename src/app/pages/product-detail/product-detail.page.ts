import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Share } from '@capacitor/share';
import { ChatService } from 'src/app/services/chat.service';
import { ProductService } from 'src/app/services/product.service';

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

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private chat_service: ChatService,
    private product_service: ProductService
  ) { }

ngOnInit() {
  const productId = this.route.snapshot.paramMap.get('id')!;
this.product_service.getProductById(+productId).subscribe(response => {
  const data = response.data;
  this.product = data.product;  // Aquí extraemos sólo el producto
  this.isLiked = data.is_liked_by_user || false;
  this.likesCount = data.total_likes || 0;

  this.product.images = this.product.images.map((img: any) => ({
    ...img,
    image_url: `http://localhost:8000/storage/${img.image_path}`
  }));
  console.log(response)
});


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


}
