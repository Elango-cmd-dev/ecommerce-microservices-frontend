import { Routes } from '@angular/router';
import { OrderListComponent } from './components/order-list-component/order-list-component';
import { ProductDetailComponent } from './components/product-detail-component/product-detail-component';
import { ProductListComponent } from './components/product-list-component/product-list-component';
import { OrderDetailComponent } from './components/order-detail-component/order-detail-component';
import { NavbarComponent } from './shared/navbar-component/navbar-component';
import { FooterComponent } from './shared/footer-component/footer-component';
import { LoginComponent } from './components/login-component/login-component';
import { RegisterComponent } from './components/register-component/register-component';
import { CartComponent } from './components/cart-component/cart-component';

export const routes: Routes = [
     { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Products
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailComponent },

  // Orders
  { path: 'orders', component: OrderListComponent },
  { path: 'orders/create', component: OrderDetailComponent },

  { path: 'navbar', component: NavbarComponent },
  { path: 'footer', component: FooterComponent },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'cart', component: CartComponent },
  
  // Fallback
  { path: '**', redirectTo: 'login' }
];
