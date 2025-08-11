import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.page.html',
  styleUrls: ['./product.page.scss'],
})
export class ProductPage implements OnInit {
  // Agregar la URL base para imágenes
  imageBaseUrl = 'http://localhost:8000/storage/';

  products: any[] = [];
  filteredProducts: any[] = [];
  searchTerm: string = '';
  selectedFilter: string = 'all';

  constructor(
    private productService: ProductService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;

    this.productService.getAllProducts(userId).subscribe(products => {
      this.products = products;
      this.filteredProducts = products; // Inicializar productos filtrados
    });
  }

  // ⭐ Función para obtener URL de foto de perfil del usuario que publica
  getUserPhotoUrl(user: any): string {
    // DEBUG: Imprimir qué propiedades tiene el usuario
    console.log('🔍 DEBUG - Usuario completo:', user);
    console.log('🔍 DEBUG - Propiedades del usuario:', Object.keys(user || {}));
    
    // Prioridad 1: Si el backend ya devuelve la URL completa
    if (user?.profile_photo_url) {
      let photoUrl = user.profile_photo_url;
      console.log('✅ Usando profile_photo_url:', photoUrl);
      // Si la URL es relativa (/storage/...), agregar el dominio
      if (photoUrl.startsWith('/storage/')) {
        photoUrl = 'http://localhost:8000' + photoUrl;
      }
      return photoUrl;
    }

    // Prioridad 2: Si tiene el path relativo en profile_photo
    if (user?.profile_photo) {
      console.log('✅ Usando profile_photo:', user.profile_photo);
      return this.imageBaseUrl + user.profile_photo;
    }

    // Prioridad 3: Si tiene avatar (como en tu HTML actual)
    if (user?.avatar) {
      console.log('✅ Usando avatar:', user.avatar);
      return this.imageBaseUrl + user.avatar;
    }

    // Fallback: avatar generado con UI Avatars
    console.log('⭐ Usando avatar generado para:', user?.name);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=9ca3af&color=fff&size=64`;
  }

  // ⭐ Función para manejar errores de imagen
  onImageError(event: any, user: any) {
    // Si falla cargar la imagen, usar avatar generado
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=9ca3af&color=fff&size=64`;
    event.target.src = fallbackUrl;
  }


  // Manejo del cambio en la búsqueda
  onSearchChange(event: any) {
    const searchTerm = event.target.value?.toLowerCase() || '';
    this.searchTerm = searchTerm;
    this.filterProducts();
  }

  // Manejo del cambio en el filtro con chips
  setFilter(filterType: string) {
    this.selectedFilter = filterType;
    this.filterProducts();
  }

  // Filtrar productos basado en el término de búsqueda y filtro seleccionado
  filterProducts() {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = [...this.products];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase();
    
    this.filteredProducts = this.products.filter(product => {
      switch (this.selectedFilter) {
        case 'location':
          return product.location?.toLowerCase().includes(searchLower);
        case 'name':
          return product.name?.toLowerCase().includes(searchLower);
        
        case 'description':
          return product.description?.toLowerCase().includes(searchLower);
        
        case 'user':
          return product.user?.name?.toLowerCase().includes(searchLower);
        
        case 'all':
        default:
          return (
            product.name?.toLowerCase().includes(searchLower) ||
            product.description?.toLowerCase().includes(searchLower) ||
            product.user?.name?.toLowerCase().includes(searchLower) ||
            product.wanted_item?.toLowerCase().includes(searchLower) ||
            product.location?.toLowerCase().includes(searchLower)
          );
      }
    });
  }

  // Resaltar término de búsqueda en el texto
  highlightSearchTerm(text: string): string {
    if (!text || !this.searchTerm.trim()) {
      return text || '';
    }

    const searchTerm = this.searchTerm.trim();
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // Limpiar búsqueda
  clearSearch() {
    this.searchTerm = '';
    this.selectedFilter = 'all';
    this.filteredProducts = [...this.products];
  }

  // Métodos existentes
  verDetalle(id: number) {
    this.router.navigate(['/product-detail', id]);
  }

  verPerfilPublico(userId: number) {
    this.router.navigate(['/profile-public', userId]);
  }
}