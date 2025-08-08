import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private baseUrl = 'http://localhost:8000/api/chats';

  constructor(private http: HttpClient) { }

  startChat(userId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/start`, { user_id: userId });
  }

}
