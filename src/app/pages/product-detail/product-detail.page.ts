import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Share } from '@capacitor/share';


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
private router: Router
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
  this.router.navigate(['/tabs/tab3/chat-detail'], {
    queryParams: {
      name: this.product.user.name  // nombre del usuario que publicó el producto
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
