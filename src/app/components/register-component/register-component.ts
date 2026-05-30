import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../../services/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-component',
  imports: [CommonModule,FormsModule,ReactiveFormsModule],
  templateUrl: './register-component.html',
  styleUrl: './register-component.scss',
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  message: string | null = null;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      userName: ['', [Validators.required]],
      userEmailId: ['', [Validators.required, Validators.email]],
      userPassword: ['', [Validators.required, Validators.minLength(6)]],
      userPhoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.message = null;
    this.error = null;

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const payload: RegisterRequest = this.registerForm.value;

    this.loading = true;

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.message = 'Account created successfully.';
        
        // Optionally auto navigate to login
        setTimeout(() => this.router.navigate(['/login']), 1000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error || 'Failed to create account.';
      }
    });
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}

