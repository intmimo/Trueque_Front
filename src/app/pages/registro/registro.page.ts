import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: false,
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {

  //inicia el formulario de registro
  registroForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    //validaciones necesarias para el registro
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]], // minimo de caracteres para contra 8
      confirmarPassword: ['', Validators.required],
      colonia: ['', Validators.required],
      municipio: ['', Validators.required]
    }, {
      validators: this.passwordsIguales
    });
  }

  //funcion para validar contraseñas
  passwordsIguales(group: AbstractControl): { [key: string]: any } | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmarPassword')?.value;
    return pass === confirm ? null : { noCoinciden: true };
  }

    //funcion para el boton, si los campos son validos redirige a login
 registrarse() {
  if (this.registroForm.invalid) return;

  const { nombre, email, password, colonia, municipio } = this.registroForm.value;

  this.authService.register(nombre, email, password, colonia, municipio).subscribe({
    next: (res) => {
      console.log('Registro exitoso:', res);
      alert('Registro exitoso');
      this.router.navigate(['/login']);
    },
    error: (err) => {
      console.error('Error al registrar:', err);
      if (err.status === 422) {
        const errores = err.error.errors;
        const mensaje = Object.values(errores).reduce((acc: any[], val) => acc.concat(val), []).join('\n');
        alert('Errores de validación:\n' + mensaje);
      } else {
        alert('Error al registrarse. Intenta más tarde.');
      }
    }
  });
}


  isFieldInvalid(campo: string): boolean {
    const control = this.registroForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  irALogin(){
    this.router.navigate(['/login']);
  }

  ngOnInit() {}
}
