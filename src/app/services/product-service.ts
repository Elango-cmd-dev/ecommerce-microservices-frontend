import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Product {
  productId: number;
  productName: string;
  productPrice: string; 
  productDescription: string;

  imageSrc?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseUrl = 'http://localhost:8000/products';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl);
  }

  getProductById(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${productId}`);
  }

  
  fetchImageBlob(productId: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${productId}/image`, { responseType: 'blob' });
  }
}
