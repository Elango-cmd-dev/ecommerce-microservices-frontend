import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Order, OrderService } from '../../services/order-service';
import { Product, ProductService } from '../../services/product-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-order-detail-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './order-detail-component.html',
  styleUrl: './order-detail-component.scss',
})
export class OrderDetailComponent implements OnInit {

  product: Product | null = null;
  quantity = 1;

  // state flags
  loadingProduct = false;
  placing = false;

  // messages
  error: string | null = null;
  success: Order | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private productService: ProductService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    const productIdParam = this.route.snapshot.queryParamMap.get('productId');
    const productId = productIdParam ? Number(productIdParam) : null;

    if (!productId) {
      this.error = 'No product selected. Go back and choose a product.';
      return;
    }

    this.loadProduct(productId);
  }

  loadProduct(productId: number): void {
    this.loadingProduct = true;
    this.error = null;

    this.productService.getProductById(productId).subscribe({
      next: (p) => {
        console.log('Order page product:', p);
        this.product = p;
        this.loadingProduct = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading product for order', err);
        this.error = 'Unable to load product details.';
        this.loadingProduct = false;
      }
    });
  }

  get totalPrice(): number {
    if (!this.product) {
      return 0;
    }
    const price = Number(this.product.productPrice) || 0;
    return this.quantity * price;
  }

  placeOrder(): void {
    if (!this.product || this.quantity < 1) {
      return;
    }

    // Get logged-in userId
    const userId = Number(localStorage.getItem('userId'));
    if (!userId) {
      this.error = 'User not logged in. Please login to place an order.';
      return;
    }

    const order: Order = {
      userId: userId,
      productId: this.product.productId,
      quantity: this.quantity
      // productName/productPrice/totalPrice will come from backend response
    };

    this.placing = true;
    this.error = null;
    this.success = null;

    this.orderService.placeOrder(order).subscribe({
      next: (res) => {
        console.log('Order response:', res);
        this.success = res;
        this.placing = false;
        alert('Your order has been placed!');
        this.router.navigate(['/products']);   // fixed path
      },
      error: (err) => {
        console.error('Error placing order', err);
        this.error = 'Failed to place order. Please try again.';
        this.placing = false;
      }
    });
  }
}
