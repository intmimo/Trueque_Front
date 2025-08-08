import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = 'http://localhost:8000/api'; // Asegúrate que es tu URL correcta

  constructor(private http: HttpClient) {}



  getAuthHeaders(): HttpHeaders {
  const token = localStorage.getItem('token');
  return new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
}



    //funcion de la pagina de registro de usuario
  register(nombre: string, email: string, password: string, colonia: string, municipio: string): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, {
      name: nombre,
      email,
      password,
      password_confirmation: password, // <- IMPORTANTE
      colonia,
      municipio
    });
  }

  //funcion de la pagina de inicio de sesion
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, {
      email,
      password
    });
  }


  getProfile(): Observable<any> {
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };
  return this.http.get(`${this.API_URL}/profile`, { headers });
}

updateProfile(payload: any): Observable<any> {
    // Enviar solo los campos que quieras actualizar
    return this.http.put(`${this.API_URL}/profile/update`, payload, {
      headers: this.getAuthHeaders(),
    });
  }



}
