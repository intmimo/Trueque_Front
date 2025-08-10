import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private url = 'http://localhost:8000/api/products';

  constructor(private http: HttpClient) { }

getAllProducts(excludeUserId?: number) {
  let url = this.url;
  if (excludeUserId) {
    url += `?exclude_user=${excludeUserId}`;
  }
  return this.http.get<any>(url);
}




  getProductById(id: number) {
    return this.http.get<any>(`${this.url}/${id}`);
  }
}
