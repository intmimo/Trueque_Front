import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = 'http://localhost:8000/api'; // Asegúrate que es tu URL correcta

  constructor(private http: HttpClient) {}



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
}
