import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; //dependencias de formulario
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service'; //servicio de autenticacion

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: FormGroup

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
    ) {
      //se requiere email y contraseña para iniciar sesion
      this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
    }

  //funcion para iniciar sesion e ir a tabs
  login() {
    if (this.loginForm.invalid) return; //valida antes de usar los datos
    const {email, password} = this.loginForm.value;
    const success = this.authService.login(email, password);

    if(success){
      this.router.navigate(['/tabs']); //redirige a las tabs
    } else {
      //alerta si hay algo incorrecto
      alert('Credenciales incorrectas')
    }
  }

  //funcion para ir a pantalla de registro
  irARegistro(){
    this.router.navigate(['/registro']);
  }

  ngOnInit() {
  }

}
