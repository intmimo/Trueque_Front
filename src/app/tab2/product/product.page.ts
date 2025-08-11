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

  products: any[] = [];
  filteredProducts: any[] = [];
  searchTerm: string = '';
  selectedFilter: string = 'all';

  constructor(
    private productService: ProductService,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;

    this.productService.getAllProducts(userId).subscribe({
      next: (products) => {
        this.products = products || [];
        this.filteredProducts = this.products;
      },
      error: () => {
        this.products = [];
        this.filteredProducts = [];
      }
    });
  }

  // Búsqueda
  onSearchChange(event: any): void {
    const searchTerm = event?.target?.value?.toLowerCase?.() || '';
    this.searchTerm = searchTerm;
    this.filterProducts();
  }

  // Filtros
  setFilter(filterType: string): void {
    this.selectedFilter = filterType;
    this.filterProducts();
  }

  // Filtrar
  filterProducts(): void {
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

  // Resaltar término de búsqueda
  highlightSearchTerm(text: string): string {
    if (!text || !this.searchTerm.trim()) return text || '';
    const searchTerm = this.searchTerm.trim();
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // Limpiar búsqueda
  clearSearch(): void {
    this.searchTerm = '';
    this.selectedFilter = 'all';
    this.filteredProducts = [...this.products];
  }

  // Navegación
  verDetalle(id: number): void {
    this.router.navigate(['/product-detail', id]);
  }

  // ⬇️ Ahora pasamos el objeto user en el state
  verPerfilPublico(user: any): void {
    if (!user) return;
    this.router.navigate(['/profile-public', user.id], {
      state: { user }
    });
  }

  // ---------- Avatar helpers ----------
  getUserAvatarSrc(user: any): string {
    if (!user) {
      return 'https://ui-avatars.com/api/?name=User&background=9ca3af&color=fff&size=64';
    }

    if (user.profile_photo_url) {
      const url: string = user.profile_photo_url;
      return url.startsWith('/storage/')
        ? `http://localhost:8000${url}`
        : url;
    }

    if (user.profile_photo) {
      return `http://localhost:8000/storage/${user.profile_photo}`;
    }

    if (user.avatar) {
      return `http://localhost:8000/storage/${user.avatar}`;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=9ca3af&color=fff&size=64`;
  }

  onUserAvatarError(event: Event, name?: string): void {
    const img = event.target as HTMLImageElement;
    const safeName = encodeURIComponent(name || 'User');
    if (img && (!img.src || !img.src.includes('ui-avatars.com'))) {
      img.src = `https://ui-avatars.com/api/?name=${safeName}&background=9ca3af&color=fff&size=64`;
    }
  }
}
