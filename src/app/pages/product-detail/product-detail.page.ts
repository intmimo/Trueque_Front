import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Share } from '@capacitor/share';
import { ChatService } from 'src/app/services/chat.service';


@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {

slideOpts = {
  initialSlide: 0,
  speed: 400,
  loop: true
};

product: any;

constructor(
private route: ActivatedRoute,
private http: HttpClient,
private router: Router,
private chat_service: ChatService
) { }

ngOnInit() {
  const productId = this.route.snapshot.paramMap.get('id');
  this.http.get(`http://localhost:8000/api/products/${productId}`).subscribe((res:any)=>{
    this.product = res.data;
    console.log('Producto cargado:', this.product);
    console.log('Imágenes del producto:', this.product.images);


    //Se usam el operador spread para dejar las propeidades originales
    //Esto es para agregar la url completa a las imagenes
    this.product.images = this.product.images.map((img:any)=>({
      ...img,
      image_url: `http://localhost:8000/storage/${img.image_path}`
    }))
  });

  }

chat() {
  this.chat_service.startChat(this.product.user.id).subscribe({
    next: (res: any) => {
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
}
