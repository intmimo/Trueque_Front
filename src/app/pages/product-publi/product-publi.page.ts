// src/app/pages/product-publi/product-publi.page.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, AlertController, LoadingController } from '@ionic/angular';
import { ProductService } from '../../services/product.service';

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
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(255)]],
      wantedItem: ['', Validators.required],
      location: ['']
    });
  }

  onImageSelected(event: any) {
    const files: FileList = event.target.files;

    if (this.selectedFiles.length + files.length > 5) {
      this.presentAlert('Solo puedes subir hasta 5 imágenes.');
      return;
    }

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        this.presentAlert('Solo se permiten archivos de imagen (jpg/png).');
        return;
      }

      // Verificar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        this.presentAlert('Cada imagen debe pesar menos de 5MB.');
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

    // Limpiar el input para poder seleccionar los mismos archivos de nuevo si es necesario
    event.target.value = '';
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

    // Mostrar loading
    const loading = await this.loadingController.create({
      message: 'Publicando producto...',
    });
    await loading.present();

    // Preparar datos para enviar
    const productData = {
      ...this.productForm.value,
      images: this.selectedFiles
    };

    // Enviar al backend
    this.productService.createProduct(productData).subscribe({
      next: async (response) => {
        await loading.dismiss();
        this.presentToast('¡Producto publicado exitosamente!');
        this.router.navigate(['/profile']);
      },
      error: async (error) => {
        await loading.dismiss();
        console.error('Error al crear producto:', error);
        
        let errorMessage = 'Error al publicar el producto. Intenta de nuevo.';
        
        // Mostrar errores específicos del backend
        if (error.error && error.error.errors) {
          const errors = error.error.errors;
          const firstError = Object.values(errors)[0] as string[];
          errorMessage = firstError[0];
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
        
        this.presentAlert(errorMessage);
      }
    });
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

  // Getter para verificar si el formulario es válido para envío
  get canSubmit(): boolean {
    return this.productForm.valid && this.selectedFiles.length > 0;
  }
}
