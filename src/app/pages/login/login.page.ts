import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; //dependencias de formulario
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service'; //servicio de autenticacion

//se agrega standalone
//se importan cosas para poder usar bien las paginas
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
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
    const { email, password } = this.loginForm.value;
    const success = this.authService.login(email, password);
    if (success) {
      this.router.navigate(['/tabs']);
    } else {
      alert('Credenciales incorrectas');
    }
  }

  ngOnInit() {
  }

}
