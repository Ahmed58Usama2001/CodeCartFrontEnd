import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../../Core/services/account.service';
import { LoginDto } from '../../../Shared/models/User';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatSnackBarModule,
    MatDividerModule
  ]
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  loading = this.accountService.loading;
  googleLoaded = this.accountService.googleLoaded;
  facebookLoaded = this.accountService.facebookLoaded;
  errorMessage = '';

  ngOnInit() {
    // External SDKs are automatically initialized by the AccountService
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  submit(): void {
    this.errorMessage = '';
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const loginData: LoginDto = {
      email: (this.email?.value ?? '').trim().toLowerCase(),
      password: (this.password?.value ?? '').trim()
    };

    this.accountService.login(loginData).subscribe({
      next: (user) => {
        if (user) {
          this.router.navigateByUrl('/');
        } else {
          this.errorMessage = 'Invalid email or password.';
        }
      },
      error: () => {
        this.errorMessage = 'Login failed. Please try again later.';
      }
    });
  }

  googleSignIn(): void {
    this.errorMessage = '';
    
    if (!this.googleLoaded()) {
      this.errorMessage = 'Google SDK not loaded yet. Please try again.';
      return;
    }

    this.accountService.triggerGoogleSignIn((response: any) => {
      this.accountService.handleGoogleSignInResponse(response).subscribe({
        next: (user) => {
          if (user) {
            this.router.navigateByUrl('/');
          } else {
            this.errorMessage = 'Google sign-in failed.';
          }
        },
        error: () => {
          this.errorMessage = 'Google sign-in error. Please try again later.';
        }
      });
    });
  }

  facebookSignIn(): void {
    this.errorMessage = '';
    
    if (!this.facebookLoaded()) {
      this.errorMessage = 'Facebook SDK not loaded yet. Please try again.';
      return;
    }

    this.accountService.triggerFacebookSignIn((response: any) => {
      this.accountService.handleFacebookSignInResponse(response).subscribe({
        next: (user) => {
          if (user) {
            this.router.navigateByUrl('/');
          } else {
            this.errorMessage = 'Facebook sign-in failed.';
          }
        },
        error: () => {
          this.errorMessage = 'Facebook sign-in error. Please try again later.';
        }
      });
    });
  }

  navigateToRegister(): void {
    this.router.navigate(['/account/register']);
  }
}