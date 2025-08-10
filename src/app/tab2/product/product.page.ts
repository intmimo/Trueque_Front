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