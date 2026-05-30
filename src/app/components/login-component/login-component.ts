import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginRequest, LoginResponse } from '../../services/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error: string | null = null;
  message: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userEmailId: ['', [Validators.required, Validators.email]],
      userPassword: ['', [Validators.required]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.error = null;
    this.message = null;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const payload: LoginRequest = this.loginForm.value;
    this.loading = true;

    this.authService.login(payload).subscribe({
      next: (res: LoginResponse) => {
        this.loading = false;
        this.message = 'Login successful';

        // Store full user info including userId
        this.authService.setLoggedInUser(res);

        this.router.navigate(['/products']);
      },
      error: (err) => {
        this.loading = false;
        // Try to read backend error, fallback to default
        this.error =
          err?.error?.message ||
          err?.error ||
          'Invalid email or password';
      }
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}
