import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private url = 'http://localhost:8000/api/products';

  constructor(private http: HttpClient) { }

  getAllProducts() {
    return this.http.get<any>(this.url);
  }

  getProductById(id: number) {
    return this.http.get<any>(`${this.url}/${id}`);
  }
}
