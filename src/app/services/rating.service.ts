import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RatingService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    // No seteamos Content-Type para FormData (el navegador pone el boundary)
    let headers = new HttpHeaders({ Accept: 'application/json' });
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }

  // POST /rate/{userId} con campo 'stars'
  rateUser(toUserId: number, stars: number, comment?: string): Observable<any> {
    const value = Math.max(1, Math.min(5, Number(stars) || 0));
    const fd = new FormData();
    fd.append('stars', String(value));
    if (comment) fd.append('comment', comment); // el back actual lo ignora; no estorba
    return this.http.post(`${this.apiUrl}/rate/${toUserId}`, fd, {
      headers: this.getAuthHeaders(),
    });
  }

  // GET /rating/{userId}
  getUserRatingSummary(toUserId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/rating/${toUserId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // Alias (mismo endpoint por ahora)
  getUserRatings(toUserId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/rating/${toUserId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  // ⚠️ Este endpoint no existe en tu back actual; dejar aquí por si luego lo agregas
  getUserRatingHistory(toUserId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/rating/history/${toUserId}`, {
      headers: this.getAuthHeaders(),
    });
  }
}
