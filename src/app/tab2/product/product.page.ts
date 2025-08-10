import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {

  products: any[] = [];

  constructor(
    private productService: ProductService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadProducts();
  }

loadProducts() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;

  this.productService.getAllProducts(userId).subscribe(products => {
    this.products = products; // ya es response.data por el map
  });
}



  verDetalle(id: number) {
    this.router.navigate(['/product-detail', id]);
  }

  verPerfilPublico(userId: number) {
  this.router.navigate(['/profile-public', userId]);
}
}
