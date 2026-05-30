import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CartItem {
  cartItemId: number;
  userId: number;
  productId: number;
  quantity: number;
  productName: string;
  productPrice: number;
  totalPrice: number;
}

export interface CartSummary {
  userId: number;
  totalQuantity: number;
  totalAmount: number;
  items: CartItem[];
}

export interface AddToCartRequest {
  userId: number;
  productId: number;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private baseUrl = 'http://localhost:8000/cart';

  constructor(private http: HttpClient) {}

  addToCart(body: AddToCartRequest): Observable<CartItem> {
    return this.http.post<CartItem>(this.baseUrl, body);
  }

  getCartByUser(userId: number): Observable<CartSummary> {
    return this.http.get<CartSummary>(`${this.baseUrl}/user/${userId}`);
  }

  removeItem(cartItemId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/item/${cartItemId}`);
  }

  clearCart(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/user/${userId}`);
  }
}
