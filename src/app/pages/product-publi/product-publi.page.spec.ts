import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductPubliPage } from './product-publi.page';

describe('ProductPubliPage', () => {
  let component: ProductPubliPage;
  let fixture: ComponentFixture<ProductPubliPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductPubliPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
