import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private API_URL = 'http://localhost:8000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Crear headers con token para peticiones autenticadas
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Crear un nuevo producto
  createProduct(productData: any): Observable<any> {
    const formData = new FormData();
    
    // Agregar datos del producto
    formData.append('name', productData.title);
    formData.append('description', productData.description);
    formData.append('wanted_item', productData.wantedItem);
    formData.append('location', productData.location || '');
    formData.append('status', 'disponible'); // Por defecto disponible
    
    // Agregar imágenes si existen
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach((file: File, index: number) => {
        formData.append('images[]', file);
      });
    }

    return this.http.post(`${this.API_URL}/products`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  // Obtener mis productos
  getMyProducts(): Observable<any> {
    return this.http.get(`${this.API_URL}/my-products`, {
      headers: this.getAuthHeaders()
    });
  }

  // Obtener un producto específico
  getProduct(id: number): Observable<any> {
    return this.http.get(`${this.API_URL}/products/${id}`);
  }

  // Obtener productos de un usuario específico
  getUserProducts(userId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/users/${userId}/products`);
  }

  // Actualizar producto
  updateProduct(id: number, productData: any): Observable<any> {
    const formData = new FormData();
    
    // Solo agregar campos que han sido modificados
    if (productData.title) formData.append('name', productData.title);
    if (productData.description) formData.append('description', productData.description);
    if (productData.wantedItem) formData.append('wanted_item', productData.wantedItem);
    if (productData.location !== undefined) formData.append('location', productData.location);
    if (productData.status) formData.append('status', productData.status);
    
    // Agregar nuevas imágenes si existen
    if (productData.images && productData.images.length > 0) {
      productData.images.forEach((file: File) => {
        formData.append('images[]', file);
      });
    }

    return this.http.put(`${this.API_URL}/products/${id}`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  // Eliminar producto
  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/products/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
