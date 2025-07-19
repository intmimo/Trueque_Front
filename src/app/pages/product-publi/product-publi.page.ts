// src/app/pages/product-publi/product-publi.page.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, AlertController } from '@ionic/angular';

@Component({
    standalone: false,
  selector: 'app-product-publi',
  templateUrl: './product-publi.page.html',
  styleUrls: ['./product-publi.page.scss'],
})
export class ProductPubliPage implements OnInit {
  productForm!: FormGroup;
  imagePreviews: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.productForm = this.fb.group({
      images: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      wantedItem: ['', Validators.required],
      location: ['']
    });
  }

  get images() {
    return this.productForm.get('images') as FormArray;
  }

  onImageSelected(event: any) {
    const files: FileList = event.target.files;

    if (this.images.length + files.length > 5) {
      this.presentAlert('Solo puedes subir hasta 5 imágenes.');
      return;
    }

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        this.presentAlert('Solo se permiten archivos de imagen (jpg/png).');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.push(reader.result as string);
        this.images.push(this.fb.control(file));
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number) {
    this.images.removeAt(index);
    this.imagePreviews.splice(index, 1);
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    console.log('Datos simulados para enviar:', {
      ...this.productForm.value,
      images: this.imagePreviews
    });

    this.presentToast('¡Publicado!');
    this.router.navigate(['/profile']);
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'success',
      position: 'bottom'
    });
    toast.present();
  }

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Atención',
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
