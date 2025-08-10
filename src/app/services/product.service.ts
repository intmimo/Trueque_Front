import { HttpClient, HttpParams } from '@angular/common/http';
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
      map(response => response.data)
    );
  }

  // Método específico para búsqueda con parámetros
  searchProducts(searchTerm?: string, location?: string, sortBy?: string, excludeUserId?: number): Observable<any> {
    let params = new HttpParams();
    
    if (searchTerm && searchTerm.trim()) {
      params = params.set('search', searchTerm.trim());
    }
    
    if (location && location.trim()) {
      params = params.set('location', location.trim());
    }
    
    if (sortBy) {
      params = params.set('sort', sortBy);
    }
    
    if (excludeUserId) {
      params = params.set('exclude_user', excludeUserId.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/products/search`, { params }).pipe(
      map(response => response.data)
    );
  }

  // Búsqueda avanzada con múltiples filtros
  advancedSearch(filters: {
    search?: string;
    location?: string;
    wantedItem?: string;
    userName?: string;
    sortBy?: 'recent' | 'name' | 'location';
    excludeUserId?: number;
  }): Observable<any> {
    let params = new HttpParams();
    
    Object.keys(filters).forEach(key => {
      const value = (filters as any)[key];
      if (value && value.toString().trim()) {
        params = params.set(key, value.toString().trim());
      }
    });

    return this.http.get<any>(`${this.apiUrl}/products/advanced-search`, { params }).pipe(
      map(response => response.data)
    );
  }

getProductById(id: number) {
  return this.http.get<any>(`${this.apiUrl}/products/${id}`, {
    headers: this.getAuthHeaders()
  });
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

  likeProduct(id: number) {
  return this.http.post<any>(`${this.apiUrl}/products/${id}/like`, {}, {
    headers: this.getAuthHeaders()
  });
}

unlikeProduct(id: number) {
  return this.http.delete<any>(`${this.apiUrl}/products/${id}/unlike`, {
    headers: this.getAuthHeaders()
  });
}

  // Obtener sugerencias de búsqueda
  getSearchSuggestions(term: string): Observable<string[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<any>(`${this.apiUrl}/products/suggestions`, { params }).pipe(
      map(response => response.data || [])
    );
  }

  // Obtener productos populares
  getPopularProducts(limit: number = 10): Observable<any[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any>(`${this.apiUrl}/products/popular`, { params }).pipe(
      map(response => response.data || [])
    );
  }
}
