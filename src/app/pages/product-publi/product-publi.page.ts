// src/app/pages/product-publi/product-publi.page.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, AlertController, LoadingController  } from '@ionic/angular';
import { ProductService } from 'src/app/services/product.service';

@Component({
    standalone: false,
  selector: 'app-product-publi',
  templateUrl: './product-publi.page.html',
  styleUrls: ['./product-publi.page.scss'],
})
export class ProductPubliPage implements OnInit {
  productForm!: FormGroup;
  imagePreviews: string[] = [];
  selectedFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.productForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      wantedItem: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  onImageSelected(event: any) {
    const files: FileList = event.target.files;

    if (this.selectedFiles.length + files.length > 10) {
      this.presentAlert('Solo puedes subir hasta 10 imágenes.');
      return;
    }

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        this.presentAlert('Solo se permiten archivos de imagen (jpg/png).');
        return;
      }

      // Agregar archivo a la lista
      this.selectedFiles.push(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  async onSubmit() {
    if (this.productForm.invalid) {
      this.presentAlert('Por favor completa todos los campos requeridos.');
      return;
    }

    if (this.selectedFiles.length === 0) {
      this.presentAlert('Debes agregar al menos una imagen.');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Publicando producto...',
      duration: 0
    });
    await loading.present();

    try {
      const productData = this.productForm.value;
      
      await this.productService.createProduct(productData, this.selectedFiles).toPromise();
      
      await loading.dismiss();
      this.presentToast('¡Producto publicado exitosamente!');
      this.router.navigate(['/profile']);
      
    } catch (error: any) {
      await loading.dismiss();
      console.error('Error al crear producto:', error);
      
      let errorMessage = 'Error al publicar el producto. Intenta de nuevo.';
      
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 401) {
        errorMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
      }
      
      this.presentAlert(errorMessage);
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
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
