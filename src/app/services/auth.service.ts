import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = 'http://localhost:8000/api'; // Asegúrate que es tu URL correcta
  private token: string | null = null;

  constructor(private http: HttpClient) {
    // Cargar token del localStorage al iniciar
    this.token = localStorage.getItem('auth_token');
  }



  // Función de registro
  register(nombre: string, email: string, password: string, colonia: string, municipio: string): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, {
      name: nombre,
      email,
      password,
      password_confirmation: password,
      colonia,
      municipio
    }).pipe(
      tap((response: any) => {
        // Guardar token cuando el registro sea exitoso
        if (response.token) {
          this.setToken(response.token);
        }
      })
    );
  }

  // Función de login
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, {
      email,
      password
    }).pipe(
      tap((response: any) => {
        // Guardar token cuando el login sea exitoso
        if (response.token) {
          this.setToken(response.token);
        }
      })
    );
  }

  // Guardar token
  private setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Obtener token
  getToken(): string | null {
    return this.token;
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  // Crear headers con token para peticiones autenticadas
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    });
  }

  // Obtener perfil del usuario
  getProfile(): Observable<any> {
    return this.http.get(`${this.API_URL}/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  // Actualizar perfil
  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.API_URL}/profile/update`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // Logout
  logout(): Observable<any> {
    return this.http.post(`${this.API_URL}/logout`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        // Limpiar token al hacer logout
        this.clearToken();
      })
    );
  }

  // Limpiar token
  private clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Método genérico para hacer peticiones autenticadas GET
  authenticatedGet(endpoint: string): Observable<any> {
    return this.http.get(`${this.API_URL}${endpoint}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Método genérico para hacer peticiones autenticadas POST
  authenticatedPost(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${this.API_URL}${endpoint}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // Método genérico para hacer peticiones autenticadas PUT
  authenticatedPut(endpoint: string, data: any): Observable<any> {
    return this.http.put(`${this.API_URL}${endpoint}`, data, {
      headers: this.getAuthHeaders()
    });
  }

  // Método genérico para hacer peticiones autenticadas DELETE
  authenticatedDelete(endpoint: string): Observable<any> {
    return this.http.delete(`${this.API_URL}${endpoint}`, {
      headers: this.getAuthHeaders()
    });
  }
}
