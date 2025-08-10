import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces para tipado
export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  colonia: string;
  municipio: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  images?: { image_path: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class ProfilePublicService {

  private apiUrl = 'http://localhost:8000/api'; // URL base corregida

  constructor(private http: HttpClient) { }

  // Obtener datos públicos de un usuario por ID
  getUserById(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}`);
  }

  // Obtener productos publicados por un usuario
  getUserProducts(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${userId}/products`);
  }

  // Método para enviar calificación (opcional si lo necesitas)
  submitRating(userId: number, rating: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${userId}/rate`, { rating });
  }
}
