import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Order {
  orderId?: number;
  productId: number;
  userId: number;
  quantity: number;
  productName?: string;
  productPrice?: number;
  totalPrice?: number;
}


@Injectable({
  providedIn: 'root',
})
export class OrderService {
   private baseUrl = 'http://localhost:8000/orders';

  constructor(private http: HttpClient) {}

  placeOrder(order: Order): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, order);
  }

  getOrdersByUser(userId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user/${userId}`);
  }
}
