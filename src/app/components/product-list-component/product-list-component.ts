import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Product, ProductService } from '../../services/product-service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product-list-component',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list-component.html',
  styleUrls: ['./product-list-component.scss'],
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  loading = false;
  error: string | null = null;

  private subs: Subscription[] = [];
  // keep track of created object URLs so we can revoke them on destroy
  private objectUrlMap = new Map<number, string>();

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.loading = true;
    this.error = null;

    const s = this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = Array.isArray(data) ? data : [];
        // for each product, try to load image
        this.products.forEach((p) => this.loadImageForProduct(p));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading products', err);
        this.error = 'Failed to load products. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.subs.push(s);
  }

  private loadImageForProduct(product: Product): void {
    if (!product?.productId) return;

    // cancel previous object URL for this product if any
    const previous = this.objectUrlMap.get(product.productId);
    if (previous) {
      URL.revokeObjectURL(previous);
      this.objectUrlMap.delete(product.productId);
    }

    const s = this.productService.fetchImageBlob(product.productId).subscribe({
      next: (blob) => {
        // If server returns 200 with image blob, create an object URL and sanitize it
        const objectUrl = URL.createObjectURL(blob);
        this.objectUrlMap.set(product.productId, objectUrl);

        // DomSanitizer.bypassSecurityTrustUrl returns a SafeValue object,
        // but binding to [src] works with string or SafeUrl. We keep the string for simplicity.
        // If your security policy wants SafeUrl, use sanitizer.bypassSecurityTrustUrl(objectUrl).
        product.imageSrc = this.sanitizer.bypassSecurityTrustUrl(objectUrl) as unknown as string;

        // trigger change detection so template updates quickly
        this.cdr.detectChanges();
      },
      error: (err) => {
        // likely 404 (no image) or CORS issue. leave product.imageSrc undefined to show placeholder.
        product.imageSrc = null;
        // you can log rare errors:
        // console.warn(`No image for product ${product.productId}`, err);
        this.cdr.detectChanges();
      }
    });

    this.subs.push(s);
  }

  ngOnDestroy(): void {
    // revoke all object URLs
    this.objectUrlMap.forEach((url) => {
      try { URL.revokeObjectURL(url); } catch {}
    });
    this.objectUrlMap.clear();

    // unsubscribe
    this.subs.forEach((s) => s.unsubscribe());
  }
}
