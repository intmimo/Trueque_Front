import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
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
      this.mostrarAlerta('Solo puedes subir hasta 10 imágenes.', 'warning');
      return;
    }

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        this.mostrarAlerta('Solo se permiten archivos de imagen (jpg/png).', 'warning');
        return;
      }

      this.selectedFiles.push(file);

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
      this.mostrarAlerta('Por favor completa todos los campos requeridos.', 'warning');
      return;
    }

    if (this.selectedFiles.length === 0) {
      this.mostrarAlerta('Debes agregar al menos una imagen.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Publicando producto...',
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

    try {
      const productData = this.productForm.value;
      await this.productService.createProduct(productData, this.selectedFiles).toPromise();

      Swal.close();

      this.resetForm();

      await this.mostrarAlerta('¡Producto publicado exitosamente!', 'success');

      setTimeout(() => {
        this.router.navigate(['/tabs/tab1'], { replaceUrl: true });
      }, 500);
    } catch (error: any) {
      Swal.close();
      console.error('Error al crear producto:', error);

      let errorMessage = 'Error al publicar el producto. Intenta de nuevo.';

      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 401) {
        errorMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';
      }

      this.mostrarAlerta(errorMessage, 'error');
    }
  }

  private resetForm() {
    this.productForm.reset();
    this.selectedFiles = [];
    this.imagePreviews = [];

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
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
