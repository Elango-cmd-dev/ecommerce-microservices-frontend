import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';              
import { Product, ProductService } from '../../services/product-service';
import { AuthService } from '../../services/auth-service';
import { CartService, AddToCartRequest } from '../../services/cart-service';

@Component({
  selector: 'app-product-detail-component',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail-component.html',
  styleUrls: ['./product-detail-component.scss'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  loading = false;            // for product loading
  addingToCart = false;       // for add-to-cart action
  error: string | null = null;

  imageSrc?: SafeUrl | null = null;    // SafeUrl used for binding to <img>
  private objectUrl?: string;          // keep created object URL so it can be revoked
  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private cartService: CartService,
    private authService: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id'); // expects route '/products/:id'
    const id = idParam ? Number(idParam) : null;

    if (!id) {
      this.error = 'Invalid product id';
      return;
    }

    this.fetchProduct(id);
  }

  private fetchProduct(id: number): void {
    this.loading = true;
    this.error = null;

    const s = this.productService.getProductById(id).subscribe({
      next: (data) => {
        this.product = data;
        this.loading = false;
        this.cdr.detectChanges();

        // After product is loaded, attempt to load its image
        this.loadImageForProduct(id);
      },
      error: (err) => {
        console.error('Error loading product detail', err);
        this.error = 'Product not found or unavailable.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });

    this.subs.push(s);
  }

  private loadImageForProduct(productId: number): void {
    // revoke previous object URL (if any)
    if (this.objectUrl) {
      try { URL.revokeObjectURL(this.objectUrl); } catch {}
      this.objectUrl = undefined;
      this.imageSrc = null;
    }

    const s = this.productService.fetchImageBlob(productId).subscribe({
      next: (blob) => {
        // create object URL and sanitize for Angular
        this.objectUrl = URL.createObjectURL(blob);
        this.imageSrc = this.sanitizer.bypassSecurityTrustUrl(this.objectUrl);
        this.cdr.detectChanges();
      },
      error: (err) => {
        // no image available or other error — leave placeholder
        this.imageSrc = null;
        // optional: log for debug
        // console.debug(`No image for product ${productId}`, err);
        this.cdr.detectChanges();
      }
    });

    this.subs.push(s);
  }

  addToCart(): void {
    if (!this.product) {
      return;
    }

    const userId = Number(localStorage.getItem('userId'));
    if (!userId) {
      this.error = 'Please login to add items to your cart.';
      this.router.navigate(['/login']);
      return;
    }

    const payload: AddToCartRequest = {
      userId,
      productId: this.product.productId,
      quantity: 1
    };

    this.addingToCart = true;
    this.error = null;

    const s = this.cartService.addToCart(payload).subscribe({
      next: (res) => {
        console.log('Added to cart:', res);
        this.addingToCart = false;
        alert('Item added to your cart!');
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error('Error adding to cart', err);
        this.error = 'Failed to add item to cart. Please try again.';
        this.addingToCart = false;
      }
    });

    this.subs.push(s);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  ngOnDestroy(): void {
    // revoke created object URL to avoid leaking memory
    if (this.objectUrl) {
      try { URL.revokeObjectURL(this.objectUrl); } catch {}
    }

    // unsubscribe all subscriptions
    this.subs.forEach(s => s.unsubscribe());
  }
}
