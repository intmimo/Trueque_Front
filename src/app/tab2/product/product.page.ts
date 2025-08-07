import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {

  products : any [] = [];

  constructor(private pro_service: ProductService,
    private router: Router,
  private http: HttpClient, ) { }

  ngOnInit() {
this.http.get('http://localhost:8000/api/products').subscribe((res: any) => {
      this.products = res.data.map((p: any) => ({
        ...p,
        firstImage: p.images?.[0]?.image_path
          ? `http://localhost:8000/storage/${p.images[0].image_path}`
          : null
      }));
    });
  }

  verDetalle(id: number) {
    this.router.navigate(['/product-detail', id]);
  }

}
