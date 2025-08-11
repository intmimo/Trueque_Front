import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ProductService } from 'src/app/services/product.service';

interface ExistingImage {
  id: number;
  url: string;   // http://localhost:8000/storage/...
  path: string;  // image_path original
  removed?: boolean;
}

@Component({
  standalone: false,
  selector: 'app-product-publi',
  templateUrl: './product-publi.page.html',
  styleUrls: ['./product-publi.page.scss'],
})
export class ProductPubliPage implements OnInit {
  productForm!: FormGroup;

  // Nuevas imágenes (local)
  imagePreviews: string[] = [];
  selectedFiles: File[] = [];

  // Modo edición
  isEdit: boolean = false;
  editingProductId?: number;
  existingImages: ExistingImage[] = []; // imágenes que ya existen en el servidor

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.productForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      wantedItem: ['', Validators.required],
      location: ['', [Validators.required, Validators.minLength(3)]],
      status: ['disponible'] // para edición si quisieras cambiar estado
    });

    // Detectar si venimos a editar
    const state: any = this.router.getCurrentNavigation()?.extras?.state || history.state;
    if (state?.mode === 'edit' && state?.product) {
      this.isEdit = true;
      const p = state.product;
      this.editingProductId = p.id;

      // Precargar formulario
      this.productForm.patchValue({
        title: p.name || '',
        description: p.description || '',
        wantedItem: p.wanted_item || '',
        location: p.location || '',
        status: p.status || 'disponible'
      });

      // Cargar imágenes existentes
      if (Array.isArray(p.images)) {
        this.existingImages = p.images.map((img: any) => ({
          id: img.id,
          path: img.image_path,
          url: `http://localhost:8000/storage/${img.image_path}`,
          removed: false
        }));
      }
    }
  }

  // --- imágenes nuevas ---
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
      reader.onload = () => this.imagePreviews.push(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  // --- imágenes existentes (servidor) ---
  toggleRemoveExisting(index: number) {
    const img = this.existingImages[index];
    if (img) img.removed = !img.removed;
  }

  async onSubmit() {
    if (this.productForm.invalid) {
      this.mostrarAlerta('Por favor completa todos los campos requeridos.', 'warning');
      return;
    }

    // Validación: en creación, al menos una imagen (nueva).
    if (!this.isEdit && this.selectedFiles.length === 0) {
      this.mostrarAlerta('Debes agregar al menos una imagen.', 'warning');
      return;
    }

    // En edición: impedir que quede sin imágenes (si borras todas las existentes, exige nuevas).
    if (this.isEdit) {
      const remainingExisting = this.existingImages.filter(i => !i.removed).length;
      if (remainingExisting === 0 && this.selectedFiles.length === 0) {
        this.mostrarAlerta('No puedes dejar el producto sin imágenes.', 'warning');
        return;
      }
    }

    Swal.fire({
      title: this.isEdit ? 'Guardando cambios...' : 'Publicando producto...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      heightAuto: false,
      backdrop: true,
      customClass: { container: 'custom-swal-container' },
      didOpen: () => {
        Swal.showLoading();
        this.fixSwalContainer();
      }
    });

    try {
      const v = this.productForm.value;

      if (this.isEdit && this.editingProductId) {
        // preparar ids de imágenes a eliminar
        const removeIds = this.existingImages.filter(i => i.removed).map(i => i.id);

        await this.productService.updateProduct(
          this.editingProductId,
          {
            title: v.title,
            description: v.description,
            wanted_item: v.wantedItem,
            location: v.location,
            status: v.status
          },
          this.selectedFiles,
          removeIds
        ).toPromise();

        Swal.close();
        await this.mostrarAlerta('¡Cambios guardados!', 'success');

        // Volver al detalle del producto actualizado
        this.router.navigate(['/product-detail', this.editingProductId], { replaceUrl: true });
        return;
      }

      // Crear
      await this.productService.createProduct(v, this.selectedFiles).toPromise();

      Swal.close();
      this.resetForm();
      await this.mostrarAlerta('¡Producto publicado exitosamente!', 'success');

      // Ir a la lista (ajusta el tab si quieres otro)
      this.router.navigate(['/tabs/tab1'], { replaceUrl: true });

    } catch (error: any) {
      Swal.close();
      console.error('Error al guardar producto:', error);

      let errorMessage = this.isEdit
        ? 'Error al guardar los cambios. Intenta de nuevo.'
        : 'Error al publicar el producto. Intenta de nuevo.';

      if (error?.error?.message)      errorMessage = error.error.message;
      else if (error?.status === 401) errorMessage = 'Tu sesión ha expirado. Por favor inicia sesión nuevamente.';

      this.mostrarAlerta(errorMessage, 'error');
    }
  }

  private resetForm() {
    this.productForm.reset({ status: 'disponible' });
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.existingImages = [];
    this.isEdit = false;
    this.editingProductId = undefined;

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
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
      customClass: { container: 'custom-swal-container' },
      didOpen: () => this.fixSwalContainer()
    });
  }

  private fixSwalContainer() {
    const container = document.querySelector('.swal2-container') as HTMLElement | null;
    if (container) {
      container.style.height = '100vh';
      container.style.width  = '100vw';
    }
  }
}
