import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    // No seteamos Content-Type para FormData (el browser pone el boundary)
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getAllProducts(excludeUserId?: number): Observable<any> {
    let endpoint = `${this.apiUrl}/products`;
    if (excludeUserId) endpoint += `?exclude_user=${excludeUserId}`;
    return this.http.get<any>(endpoint).pipe(map(r => r.data));
  }

  // Búsqueda simple
  searchProducts(
    searchTerm?: string,
    location?: string,
    sortBy?: string,
    excludeUserId?: number
  ): Observable<any> {
    let params = new HttpParams();
    if (searchTerm?.trim())  params = params.set('search', searchTerm.trim());
    if (location?.trim())    params = params.set('location', location.trim());
    if (sortBy)              params = params.set('sort', sortBy);
    if (excludeUserId)       params = params.set('exclude_user', excludeUserId.toString());
    return this.http.get<any>(`${this.apiUrl}/products/search`, { params }).pipe(map(r => r.data));
  }

  // Búsqueda avanzada
  advancedSearch(filters: {
    search?: string;
    location?: string;
    wantedItem?: string;
    userName?: string;
    sortBy?: 'recent' | 'name' | 'location';
    excludeUserId?: number;
  }): Observable<any> {
    let params = new HttpParams();
    Object.keys(filters || {}).forEach(key => {
      const val = (filters as any)[key];
      if (val && val.toString().trim()) params = params.set(key, val.toString().trim());
    });
    return this.http.get<any>(`${this.apiUrl}/products/advanced-search`, { params }).pipe(map(r => r.data));
  }

  getProductById(id: number) {
    return this.http.get<any>(`${this.apiUrl}/products/${id}`, { headers: this.getAuthHeaders() });
  }

  // Crear
  createProduct(productData: any, images: File[]): Observable<any> {
    const formData = new FormData();

    const name        = (productData?.title || '').trim();
    const description = (productData?.description || '').trim();
    const wantedItem  = (productData?.wantedItem || '').trim();
    const location    = (productData?.location || '').trim() || 'Sin especificar';

    formData.append('name', name);
    formData.append('description', description);
    formData.append('wanted_item', wantedItem);
    formData.append('location', location);
    formData.append('status', 'disponible');

    (images || []).forEach(file => formData.append('images[]', file));

    return this.http.post<any>(`${this.apiUrl}/products`, formData, {
      headers: this.getAuthHeaders()
    }).pipe(map(r => r.data));
  }

  // EDITAR (texto + imágenes nuevas + eliminar imágenes)
  updateProduct(
    id: number,
    productData: {
      name?: string;
      title?: string;
      description?: string;
      wanted_item?: string;
      wantedItem?: string;
      location?: string;
      status?: 'disponible' | 'intercambiado';
    },
    newImages: File[] = [],
    removeImageIds: Array<number | string> = []
  ): Observable<any> {
    const form = new FormData();

    // Acepta tanto campos del form (title, wantedItem) como los del back (name, wanted_item)
    const name        = (productData?.name ?? productData?.title ?? '').trim();
    const description = (productData?.description ?? '').trim();
    const wantedItem  = (productData?.wanted_item ?? productData?.wantedItem ?? '').trim();
    const location    = (productData?.location ?? '').trim();
    const status      = productData?.status;

    if (name)        form.append('name', name);
    if (description) form.append('description', description);
    if (wantedItem)  form.append('wanted_item', wantedItem);
    if (location)    form.append('location', location);
    if (status)      form.append('status', status);

    (newImages || []).forEach(f => form.append('images[]', f));
    (removeImageIds || []).forEach(idToRemove => form.append('remove_images[]', String(idToRemove)));

    // Laravel: usar POST + _method para PATCH multipart
    form.append('_method', 'PATCH');

    return this.http.post<any>(`${this.apiUrl}/products/${id}`, form, {
      headers: this.getAuthHeaders()
    }).pipe(map(r => r.data ?? r));
  }

  getMyProducts(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/my-products`, {
      headers: this.getAuthHeaders()
    }).pipe(map(r => r.data));
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

  // Sugerencias
  getSearchSuggestions(term: string): Observable<string[]> {
    const params = new HttpParams().set('term', term);
    return this.http.get<any>(`${this.apiUrl}/products/suggestions`, { params }).pipe(
      map(r => r.data || [])
    );
  }

  // Populares
  getPopularProducts(limit: number = 10): Observable<any[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<any>(`${this.apiUrl}/products/popular`, { params }).pipe(
      map(r => r.data || [])
    );
  }
}
