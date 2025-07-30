import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
})
export class ProductDetailPage implements OnInit {
toggleLike() {
throw new Error('Method not implemented.');
}
startChat() {
throw new Error('Method not implemented.');
}
shareProduct() {
throw new Error('Method not implemented.');
}
product: any;
liked: boolean = false;
imageBaseUrl = '';

constructor(
  private route: ActivatedRoute,
  private http: HttpClient
) { }

  ngOnInit() {
  }

}
