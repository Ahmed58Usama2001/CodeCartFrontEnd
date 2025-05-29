import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../../Core/services/account.service';
import { RegisterDto } from '../../../Shared/models/User';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SnackbarService } from '../../../Core/services/snackbar.service';

// Custom validator for password confirmation
function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  
  if (!password || !confirmPassword) {
    return null;
  }
  
  return password.value === confirmPassword.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
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
    MatDividerModule,
    MatCheckboxModule
  ]
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);
  private snackBar = inject(SnackbarService);

  registerForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required, 
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    ]],
    confirmPassword: ['', [Validators.required]],
    agreeToTerms: [false, [Validators.requiredTrue]]
  }, { validators: passwordMatchValidator });

  loading = this.accountService.loading;
  googleLoaded = this.accountService.googleLoaded;
  facebookLoaded = this.accountService.facebookLoaded;
  errorMessage = '';
  hidePassword = true;
  hideConfirmPassword = true;

  ngOnInit() {
    // External SDKs are automatically initialized by the AccountService
  }

  get firstName() {
    return this.registerForm.get('firstName');
  }

  get lastName() {
    return this.registerForm.get('lastName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get agreeToTerms() {
    return this.registerForm.get('agreeToTerms');
  }

  submit(): void {
    this.errorMessage = '';
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const registerData: RegisterDto = {
      firstName: (this.firstName?.value ?? '').trim(),
      lastName: (this.lastName?.value ?? '').trim(),
      email: (this.email?.value ?? '').trim().toLowerCase(),
      password: (this.password?.value ?? '').trim()
    };

    this.accountService.register(registerData).subscribe({
      next: (success) => {
        if (success) {
         this.snackBar.success('Registration successful! Please log in.')
          this.router.navigate(['/account/login']);
        } else {
          this.errorMessage = 'Registration failed. Please try again.';
        }
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.snackBar.error('Registration failed. Please try again later.')
        this.errorMessage = error?.error?.message || 'Registration failed. Please try again later.';
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

  navigateToLogin(): void {
    this.router.navigate(['/account/login']);
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}