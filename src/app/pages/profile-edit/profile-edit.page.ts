import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoadingController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

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
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
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
      colonia: ['',[Validators.maxLength(255)]],
      municipio: ['',[Validators.maxLength(255)]],
      password: [''],                 // opcional
      password_confirmation: ['']     // opcional
    });
  }

  private async loadProfile() {
    const loading = await this.loadingCtrl.create({ message: 'Cargando perfil...' });
    await loading.present();

    this.authService.getProfile().subscribe({
      next: async (res) => {
        await loading.dismiss();
        this.user = res.user;

        // Prefill con datos actuales
        this.form.patchValue({
          name: this.user?.name || '',
          email: this.user?.email || '',
          colonia: this.user?.colonia || '',
          municipio: this.user?.municipio || ''
        });
      },
      error: async (err) => {
        await loading.dismiss();
        console.error(err);
        this.presentToast('No se pudo cargar el perfil', 'danger');
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

    // Solo incluimos los campos modificados o no vacíos
    if (values.name && values.name !== this.user.name) payload.name = values.name;
    if (values.email && values.email !== this.user.email) payload.email = values.email;
    if (values.colonia !== this.user.colonia) payload.colonia = values.colonia ?? '';
    if (values.municipio !== this.user.municipio) payload.municipio = values.municipio ?? '';

    if (values.password) {
      if (values.password.length < 8) {
        this.presentToast('La contraseña debe tener al menos 8 caracteres', 'warning');
        return;
      }
      if (values.password !== values.password_confirmation) {
        this.presentToast('Las contraseñas no coinciden', 'warning');
        return;
      }
      payload.password = values.password;
      payload.password_confirmation = values.password_confirmation;
    }

    const loading = await this.loadingCtrl.create({ message: 'Guardando...' });
    await loading.present();

    this.authService.updateProfile(payload).subscribe({
      next: async (res) => {
        await loading.dismiss();
        this.presentToast('Perfil actualizado', 'success');
        // Regresamos a la pantalla de perfil
        this.router.navigate(['/tabs']);
      },
      error: async (err) => {
        await loading.dismiss();
        console.error(err);
        if (err.status === 422 && err.error?.errors) {
          const firstKey = Object.keys(err.error.errors)[0];
          this.presentToast(err.error.errors[firstKey][0], 'danger');
        } else {
          this.presentToast('No se pudo actualizar el perfil', 'danger');
        }
      }
    });
  }

  private async presentToast(message: string, color: 'success'|'warning'|'danger'='success') {
    const toast = await this.toastCtrl.create({ message, duration: 1800, color, position: 'bottom' });
    toast.present();
  }
}
