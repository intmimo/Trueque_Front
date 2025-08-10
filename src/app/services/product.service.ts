import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private url = 'http://tu-api.com/api/products';

  constructor(private http: HttpClient) { }

  getAllProducts(excludeUserId?: number): Observable<any> {
    let endpoint = this.url;
    if (excludeUserId) {
      endpoint += `?exclude_user=${excludeUserId}`;
    }
    return this.http.get<any>(endpoint);
  }
}
