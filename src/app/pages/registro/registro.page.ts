import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

//se agrega standalone
//se importan cosas para poder usar bien las paginas
@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
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

  registrarse() {
    if (this.registroForm.invalid) return;

    const { nombre, email, password, colonia, municipio } = this.registroForm.value;
    this.authService.register(nombre, email, password, colonia, municipio);
    this.router.navigate(['/login']);
  }

  isFieldInvalid(campo: string): boolean {
    const control = this.registroForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  ngOnInit() {}
}
