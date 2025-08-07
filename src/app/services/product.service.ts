import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:8000/api/product';

  constructor(private http: HttpClient) {
  }

  getAllProducts() {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getProductById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }
}
