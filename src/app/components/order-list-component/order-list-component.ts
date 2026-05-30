import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Order, OrderService } from '../../services/order-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-list-component',
  imports: [CommonModule],
  templateUrl: './order-list-component.html',
  styleUrl: './order-list-component.scss',
})
export class OrderListComponent implements OnInit {

  orders: Order[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private orderService: OrderService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.loading = true;
    this.error = null;

    const userId = Number(localStorage.getItem("userId"));

    if (!userId) {
      this.error = "User Id missing. Please login again.";
      this.loading = false;
      return;
    }

    this.orderService.getOrdersByUser(userId).subscribe({
      next: (data) => {
        console.log('My Orders:', data);
        this.orders = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading orders', err);
        this.error = 'Failed to load orders. Please try again.';
        this.loading = false;
      }
    });
  }
}
