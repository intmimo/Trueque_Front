import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usuarios: any[] = [];

  constructor() { }

  //funcion de la pagina de registro de usuario
  register(nombre: string, email: string, password: string, colonia: string, municipio: string): void {
  const user = { nombre, email, password, colonia, municipio };
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
  usuarios.push(user);
  localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

  //funcion de la pagina de inicio de sesion
  login(email: string, password: string): boolean {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const user = usuarios.find((u: any) => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem('logueado', JSON.stringify(user));
      return true;
    }
    return false;
  }

  //muestra que el usuario esta deslogueadao en el localstorage
  logout() {
    localStorage.removeItem('logueado');
  }
  //muestra que el usuario esta logueadao en el localstorage
  isLoggedIn(): boolean {
    return !!localStorage.getItem('logueado');
  }
}
