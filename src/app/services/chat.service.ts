import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: any;
  }
}

window.Pusher = Pusher;

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private API_URL = 'http://localhost:8000/api';
  private echo: any; // evitamos genéricos para no pelear con TS
  private activeChannels = new Set<string>(); // para no duplicar listeners

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // 🔹 Inicializar conexión a Pusher/Echo
  initEcho(): void {
    const token = localStorage.getItem('token');
    if (this.echo) return; // ya inicializado

    this.echo = new Echo({
      broadcaster: 'pusher',
      key: '200724c942b1345298bf', // PUSHER_APP_KEY
      cluster: 'us2',              // PUSHER_APP_CLUSTER
      forceTLS: true,
      authEndpoint: 'http://localhost:8000/broadcasting/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
  }

  // 🔹 Suscribirse a un chat y escuchar mensajes en tiempo real
  listenToChat(chatId: number, callback: (data: any) => void) {
    this.initEcho();
    const channelName = `chat.${chatId}`;

    // Evitar suscripciones duplicadas si vuelven a llamar
    if (this.activeChannels.has(channelName)) {
      this.leaveChat(chatId);
    }

    this.echo.private(channelName)
      .listen('.message.sent', (e: any) => {
        callback(e);
      });

    this.activeChannels.add(channelName);
    console.log(`✅ Suscrito a ${channelName}`);
  }

  // 🔹 Salirse del canal del chat (llamar al salir de la pantalla)
  leaveChat(chatId: number) {
    if (!this.echo) return;
    const channelName = `chat.${chatId}`;
    this.echo.leave(`private-${channelName}`); // Echo usa prefijo private-
    this.activeChannels.delete(channelName);
    console.log(`🔌 Saliste de ${channelName}`);
  }

  // 🔹 (Opcional) Cerrar completamente Echo (por ejemplo, al cerrar sesión)
  destroyEcho() {
    if (this.echo) {
      // salir de todos los canales activos
      this.activeChannels.forEach((name) => this.echo.leave(`private-${name}`));
      this.activeChannels.clear();

      this.echo.disconnect();
      this.echo = null;
      console.log('🧹 Echo desconectado completamente');
    }
  }

  // 🔹 Obtener lista de chats
  getChats(): Observable<any> {
    return this.http.get(`${this.API_URL}/chats`, {
      headers: this.getHeaders()
    });
  }

  // 🔹 Obtener mensajes de un chat
  getMessages(chatId: number): Observable<any> {
    return this.http.get(`${this.API_URL}/chats/${chatId}/messages`, {
      headers: this.getHeaders()
    });
  }

  // 🔹 Enviar mensaje de texto o imagen
  sendMessage(chatId: number, content: string, image?: File): Observable<any> {
    const formData = new FormData();
    formData.append('content', content);
    if (image) formData.append('image', image);

    return this.http.post(`${this.API_URL}/chats/${chatId}/send`, formData, {
      headers: this.getHeaders()
    });
  }

  // 🔹 Iniciar un nuevo chat con un usuario
  startChat(userId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/chats/start`, { user_id: userId }, {
      headers: this.getHeaders()
    });
  }
}
