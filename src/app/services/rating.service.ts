import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) { }

  // Como tus endpoints son públicos, no es necesario enviar Authorization
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  rateUser(toUserId: number, stars: number, comment?: string): Observable<any> {
  const body: any = { stars };
  if (comment) {
    body.comment = comment;
  }
  return this.http.post(
    `${this.apiUrl}/rate/${toUserId}`,
    body,
    { headers: this.getAuthHeaders() }
  );
}

private getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
  let headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });
  if (token) {
    headers = headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}



  getUserRatingSummary(toUserId: number): Observable<any> {
  return this.http.get(
    `${this.apiUrl}/rating/${toUserId}`,
    { headers: this.getAuthHeaders() }  // <-- Cambiado para enviar token
  );
}

  getUserRatings(toUserId: number): Observable<any> {
  return this.http.get(
    `${this.apiUrl}/rating/${toUserId}`,
    { headers: this.getAuthHeaders() }
  );
}

}
