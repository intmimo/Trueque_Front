import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token') || '';
    return {
      Authorization: `Bearer ${token}`
    };
  }
getAllProducts(excludeUserId?: number): Observable<any> {
  let endpoint = `${this.apiUrl}/products`;
  if (excludeUserId) {
    endpoint += `?exclude_user=${excludeUserId}`;
  }
  return this.http.get<any>(endpoint).pipe(
    map(response => response.data) // Extraer data aquí para simplificar
  );
}


  getProductById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/products/${id}`).pipe(
      map(response => response.data)
    );
  }

  createProduct(productData: any, images: File[]): Observable<any> {
    const formData = new FormData();

    // Datos del producto
    formData.append('name', productData.title);
    formData.append('description', productData.description);
    formData.append('wanted_item', productData.wantedItem);
    formData.append('location', productData.location || '');
    formData.append('status', 'disponible');

    // Imágenes
    images.forEach((image, index) => {
      formData.append(`images[${index}]`, image);
    });

    return this.http.post<any>(`${this.apiUrl}/products`, formData, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  getMyProducts(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/my-products`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => response.data)
    );
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/products/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
