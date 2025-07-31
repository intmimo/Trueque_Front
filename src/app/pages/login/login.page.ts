import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: FormGroup;

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

  // Función helper para configurar el contenedor de SweetAlert2
  private fixSwalContainer() {
    const container = document.querySelector('.swal2-container');
    if (container) {
      (container as HTMLElement).style.height = '100vh';
      (container as HTMLElement).style.width = '100vw';
    }
  }

  // Función para iniciar sesión e ir a tabs
  login() {
    if (this.loginForm.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Formulario inválido',
        text: 'Por favor, completa todos los campos correctamente.',
        confirmButtonColor: '#ef4444',
        backdrop: true,
        allowOutsideClick: true,
        allowEscapeKey: true,
        heightAuto: false,
        customClass: {
          container: 'custom-swal-container'
        },
        didOpen: () => {
          this.fixSwalContainer();
        }
      });
      return;
    }

    const { email, password } = this.loginForm.value;

    // Mostrar alerta de carga
    Swal.fire({
      title: 'Iniciando sesión...',
      text: 'Por favor espera un momento',
      allowOutsideClick: false,
      allowEscapeKey: false,
      heightAuto: false,
      didOpen: () => {
        Swal.showLoading();
        this.fixSwalContainer();
      }
    });

    //funcion y alerta si se inicia sesion correctamente
    this.authService.login(email, password).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Has iniciado sesión correctamente.',
          confirmButtonColor: '#38bdf8',
          backdrop: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          heightAuto: false,
          timer: 2000,
          timerProgressBar: true,
          customClass: {
            container: 'custom-swal-container'
          },
          didOpen: () => {
            this.fixSwalContainer();
          }
        }).then(() => {
          this.router.navigate(['/tabs']); // Redirige a las tabs
        });
      },
      // Alerta si hay algo incorrecto
      error: (err) => {
        console.error('Error al iniciar sesión:', err);

        let errorTitle = 'Error al iniciar sesión';
        let errorMessage = 'Credenciales incorrectas o error del servidor';

        // Personalizar mensaje según el tipo de error
        if (err.status === 401) {
          errorTitle = 'Credenciales incorrectas';
          errorMessage = 'El email o la contraseña son incorrectos.';
        } else if (err.status === 422) {
          errorTitle = 'Datos inválidos';
          errorMessage = 'Por favor verifica que el email y contraseña sean válidos.';
        } else if (err.status >= 500) {
          errorTitle = 'Error del servidor';
          errorMessage = 'Ocurrió un problema en el servidor. Inténtalo más tarde.';
        }

        //alerta de error
        Swal.fire({
          icon: 'error',
          title: errorTitle,
          text: errorMessage,
          confirmButtonColor: '#ef4444',
          backdrop: true,
          allowOutsideClick: true,
          allowEscapeKey: true,
          heightAuto: false,
          customClass: {
            container: 'custom-swal-container'
          },
          didOpen: () => {
            this.fixSwalContainer();
          }
        });
      }
    });
  }

  // Función para ir a pantalla de registro
  irARegistro() {
    this.router.navigate(['/registro']);
  }

  ngOnInit() {}
}
