// src/app/services/rating.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private API_URL = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  /** Headers con token */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  /** Calificar a un usuario (1 a 5). Opcional: comment */
  rateUser(ratedUserId: number, value: number, comment?: string): Observable<any> {
    if (value < 1 || value > 5) {
      return throwError(() => new Error('El valor de la calificación debe estar entre 1 y 5.'));
    }
    const body: any = { rated_user_id: ratedUserId, value };
    if (comment?.trim()) body.comment = comment.trim();

    return this.http.post(`${this.API_URL}/ratings`, body, {
      headers: this.getAuthHeaders()
    });
  }

  /** Listado de calificaciones recibidas + summary */
  getUserRatings(userId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/users/${userId}/ratings`, {
      headers: this.getAuthHeaders()
    });
  }

  /** (Opcional) Solo resumen */
  getUserRatingSummary(userId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/users/${userId}/rating/summary`, {
      headers: this.getAuthHeaders()
    });
  }


}
