import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

   //funcion para iniciar sesion e ir a tabs
  login() {
    if (this.loginForm.invalid) return; //valida antes de usar los datos

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.router.navigate(['/tabs']);//redirige a las tabs
      },
      //alerta si hay algo incorrecto
      error: (err) => {
        this.errorMessage = 'Credenciales incorrectas o error del servidor';
        console.error(err);
      }
    });
  }
//funcion para ir a pantalla de registro
  irARegistro() {
    this.router.navigate(['/registro']);
  }

  ngOnInit() {}
}
