import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  registroForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmarPassword: ['', Validators.required],
      colonia: ['', Validators.required],
      municipio: ['', Validators.required]
    }, {
      validators: this.passwordsIguales
    });
  }

  //funcion que revisa las contras iguales
  passwordsIguales(group: AbstractControl): { [key: string]: any } | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmarPassword')?.value;
    return pass === confirm ? null : { noCoinciden: true };
  }

  //muestra error si no se pudo registrar
  registrarse() {
    if (this.registroForm.invalid) {
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

    const { nombre, email, password, colonia, municipio } = this.registroForm.value;

    //animacion de loading
    Swal.fire({
      title: 'Registrando...',
      text: 'Por favor espera un momento',
      allowOutsideClick: false,
      allowEscapeKey: false,
      heightAuto: false,
      didOpen: () => {
        Swal.showLoading();
        this.fixSwalContainer();
      }
    });

    //funcion y alerta de que se registró correctamente
    this.authService.register(nombre, email, password, colonia, municipio).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: '¡Registro exitoso!',
          text: 'Tu cuenta ha sido creada correctamente.',
          confirmButtonColor: '#38bdf8',
          backdrop: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          heightAuto: false,
          customClass: {
            container: 'custom-swal-container'
          },
          didOpen: () => {
            this.fixSwalContainer();
          }//redirigir a login
        }).then(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        console.error('Error al registrar:', err);

        if (err.status === 422) {
          const errores = err.error.errors;
          const mensaje = Object.values(errores)
            .reduce((acc: any[], val) => acc.concat(val), [])
            .join('\n');

            //alerta de errores en la validacion
          Swal.fire({
            icon: 'warning',
            title: 'Errores de validación',
            text: mensaje,
            confirmButtonColor: '#f59e0b',
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

          //alerta de error
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error de servidor',
            text: 'Ocurrió un problema al registrarte. Inténtalo más tarde.',
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
      }
    });
  }

  isFieldInvalid(campo: string): boolean {
    const control = this.registroForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  irALogin() {
    this.router.navigate(['/login']);
  }

  // Función helper para configurar el contenedor de SweetAlert2
  private fixSwalContainer() {
    const container = document.querySelector('.swal2-container');
    if (container) {
      (container as HTMLElement).style.height = '100vh';
      (container as HTMLElement).style.width = '100vw';
    }
  }

  ngOnInit() {}
}
