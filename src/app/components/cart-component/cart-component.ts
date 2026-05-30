import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

import { CartService, CartSummary, CartItem } from '../../services/cart-service';
import { ProductService } from '../../services/product-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-cart-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-component.html',
  styleUrls: ['./cart-component.scss'],
})
export class CartComponent implements OnInit, OnDestroy {
  cart: CartSummary | null = null;
  loading = false;
  error: string | null = null;

  // map productId -> objectUrl (string) so we can revoke later
  private objectUrlMap = new Map<number, string>();
  // map productId -> SafeUrl for binding
  public imageMap = new Map<number, SafeUrl | null>();

  private subs: Subscription[] = [];

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.error = null;

    const userId = Number(localStorage.getItem('userId'));
    if (!userId) {
      this.error = 'Please login to view your cart.';
      this.loading = false;
      return;
    }

    const s = this.cartService.getCartByUser(userId).subscribe({
      next: (summary) => {
        this.cart = summary;
        this.loading = false;
        this.cdr.detectChanges();

        // load product images for each cart item (non-blocking)
        if (this.cart && this.cart.items) {
          this.cart.items.forEach(item => this.loadImageForCartItem(item));
        }
      },
      error: (err) => {
        console.error('Error loading cart', err);
        this.error = 'Failed to load cart. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.subs.push(s);
  }

  private loadImageForCartItem(item: CartItem): void {
    if (!item || !item.productId) return;

    // If we already loaded image for this product, skip
    if (this.imageMap.has(item.productId)) return;

    // fetch image blob from ProductService
    const s = this.productService.fetchImageBlob(item.productId).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        this.objectUrlMap.set(item.productId, objectUrl);
        const safe = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
        this.imageMap.set(item.productId, safe);
        this.cdr.detectChanges();
      },
      error: (err) => {
        // No image or other error — set null so template shows placeholder
        this.imageMap.set(item.productId, null);
        // optional log:
        // console.debug(`No image for product ${item.productId}`, err);
        this.cdr.detectChanges();
      }
    });

    this.subs.push(s);
  }

  removeItem(item: CartItem): void {
    if (!confirm(`Remove "${item.productName}" from cart?`)) {
      return;
    }

    const s = this.cartService.removeItem(item.cartItemId).subscribe({
      next: () => {
        // release image for this product (if any)
        this.revokeImageForProduct(item.productId);
        // reload cart
        this.loadCart();
      },
      error: (err) => {
        console.error('Error removing item', err);
        this.error = 'Failed to remove item. Please try again.';
        this.cdr.detectChanges();
      }
    });

    this.subs.push(s);
  }

  clearCart(): void {
    if (!this.cart) return;

    if (!confirm('Clear all items from your cart?')) {
      return;
    }

    const userId = Number(localStorage.getItem('userId'));
    const s = this.cartService.clearCart(userId).subscribe({
      next: () => {
        // revoke all cached images
        this.revokeAllImages();
        // reset cart locally and reload
        this.cart = { userId, totalQuantity: 0, totalAmount: 0, items: [] };
        this.loadCart();
      },
      error: (err) => {
        console.error('Error clearing cart', err);
        this.error = 'Failed to clear cart. Please try again.';
        this.cdr.detectChanges();
      }
    });

    this.subs.push(s);
  }

  proceedToCheckout(): void {
    if (!this.cart || this.cart.totalQuantity === 0) {
      return;
    }

    // Example: navigate to orders page
    this.router.navigate(['/orders']);
  }

  goToProducts(): void {
    this.router.navigate(['/products']);
  }

  get hasItems(): boolean {
    return !!this.cart && !!this.cart.items && this.cart.items.length > 0;
  }

  // helper to revoke single product object URL
  private revokeImageForProduct(productId: number): void {
    const url = this.objectUrlMap.get(productId);
    if (url) {
      try { URL.revokeObjectURL(url); } catch (e) {}
      this.objectUrlMap.delete(productId);
    }
    this.imageMap.delete(productId);
  }

  // revoke all cached object URLs
  private revokeAllImages(): void {
    this.objectUrlMap.forEach(url => {
      try { URL.revokeObjectURL(url); } catch (e) {}
    });
    this.objectUrlMap.clear();
    this.imageMap.clear();
  }

  ngOnDestroy(): void {
    // revoke object URLs and unsubscribe
    this.revokeAllImages();
    this.subs.forEach(s => s.unsubscribe());
  }
  onThumbLoad(event: Event) {
  (event.target as HTMLImageElement).classList.add('loaded');
}

}
