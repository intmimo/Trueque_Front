import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.page.html',
  styleUrls: ['./profile-edit.page.scss'],
  standalone: false
})
export class ProfileEditPage implements OnInit {
  form!: FormGroup;
  showPassword = false;
  user: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.buildForm();
    this.loadProfile();
  }

  private buildForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
      colonia: ['', [Validators.maxLength(255)]],
      municipio: ['', [Validators.maxLength(255)]],
      password: [''],                 // opcional
      password_confirmation: ['']    // opcional
    });
  }

  private async loadProfile() {
    Swal.fire({
      title: 'Cargando perfil...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      heightAuto: false,
      backdrop: true,
      customClass: {
        container: 'custom-swal-container'
      },
      didOpen: () => {
        Swal.showLoading();
        this.fixSwalContainer();
      }
    });

    this.authService.getProfile().subscribe({
      next: (res) => {
        Swal.close();
        this.user = res.user;

        this.form.patchValue({
          name: this.user?.name || '',
          email: this.user?.email || '',
          colonia: this.user?.colonia || '',
          municipio: this.user?.municipio || ''
        });
      },
      error: (err) => {
        Swal.close();
        console.error(err);
        this.mostrarAlerta('No se pudo cargar el perfil', 'error');
      }
    });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  async submit() {
    if (this.form.invalid) return;

    const values = this.form.value;
    const payload: any = {};

    if (values.name && values.name !== this.user.name) payload.name = values.name;
    if (values.email && values.email !== this.user.email) payload.email = values.email;
    if (values.colonia !== this.user.colonia) payload.colonia = values.colonia ?? '';
    if (values.municipio !== this.user.municipio) payload.municipio = values.municipio ?? '';

    if (values.password) {
      if (values.password.length < 8) {
        this.mostrarAlerta('La contraseña debe tener al menos 8 caracteres', 'warning');
        return;
      }
      if (values.password !== values.password_confirmation) {
        this.mostrarAlerta('Las contraseñas no coinciden', 'warning');
        return;
      }
      payload.password = values.password;
      payload.password_confirmation = values.password_confirmation;
    }

    Swal.fire({
      title: 'Guardando...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      heightAuto: false,
      backdrop: true,
      customClass: {
        container: 'custom-swal-container'
      },
      didOpen: () => {
        Swal.showLoading();
        this.fixSwalContainer();
      }
    });

    this.authService.updateProfile(payload).subscribe({
      next: (res) => {
        Swal.close();
        this.mostrarAlerta('Perfil actualizado', 'success').then(() => {
          this.router.navigate(['/tabs']);
        });
      },
      error: (err) => {
        Swal.close();
        console.error(err);
        if (err.status === 422 && err.error?.errors) {
          const firstKey = Object.keys(err.error.errors)[0];
          this.mostrarAlerta(err.error.errors[firstKey][0], 'error');
        } else {
          this.mostrarAlerta('No se pudo actualizar el perfil', 'error');
        }
      }
    });
  }

  private async mostrarAlerta(message: string, icon: 'success' | 'warning' | 'error') {
    return Swal.fire({
      icon,
      title: message,
      confirmButtonColor: icon === 'success' ? '#38bdf8' : icon === 'warning' ? '#f59e0b' : '#ef4444',
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

  private fixSwalContainer() {
    const container = document.querySelector('.swal2-container');
    if (container) {
      (container as HTMLElement).style.height = '100vh';
      (container as HTMLElement).style.width = '100vw';
    }
  }
}
