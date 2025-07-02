import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { environment } from '../../../environments/environment.development';
import { AuthStateService } from './authstate.service';
import { SignalrService } from './signalr.service';
import { User, UserDto, RegisterDto, LoginDto, ForgetPasswordDto, ResetPasswordDto, Address } from '../../Shared/models/User';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private baseUrl = environment.apiUrl + 'account';

  private authStateService = inject(AuthStateService);
  private signalrService = inject(SignalrService);

  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);
  private loadingSignal = signal<boolean>(false);

  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly token = this.tokenSignal.asReadonly();
  public readonly loading = this.loadingSignal.asReadonly();

  public readonly isLoggedIn = computed(() => this.currentUser() !== null);
  public readonly isAuthenticated = computed(() =>
    this.currentUser() !== null && this.token() !== null
  );
  public readonly userDisplayName = computed(() => {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}`.trim() : '';
  });
  public readonly userInitials = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
  });

  constructor(private http: HttpClient) {
    effect(() => {
      const user = this.currentUser();
      const token = this.token();

      if (user && token) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    });
  }

  register(registerData: RegisterDto): Observable<UserDto | null> {
    this.loadingSignal.set(true);
    return this.http.post<UserDto>(`${this.baseUrl}/register`, registerData)
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          if (response && response.token) {
            this.setCurrentUser(response);
            this.authStateService.handleUserRegistration(response.email).subscribe();
            // Start SignalR connection after successful registration
            this.startSignalRConnection(response.token);
            return response;
          }
          return null;
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          return this.handleError<UserDto | null>('register', null)(error);
        })
      );
  }

  login(loginData: LoginDto): Observable<UserDto | null> {
    this.loadingSignal.set(true);
    return this.http.post<UserDto>(`${this.baseUrl}/login`, loginData)
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          if (response && response.token) {
            this.setCurrentUser(response);
            this.authStateService.handleUserLogin(response.email).subscribe();
            // Start SignalR connection after successful login
            this.startSignalRConnection(response.token);
            return response;
          }
          return null;
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          return this.handleError<UserDto | null>('login', null)(error);
        })
      );
  }

  logout(): Observable<any> {
    this.loadingSignal.set(true);
    const currentEmail = this.getCurrentUserValue()?.email || null;
    
    return this.http.post(`${this.baseUrl}/logout`, {})
      .pipe(
        map(() => {
          this.loadingSignal.set(false);
          this.authStateService.handleUserLogout(currentEmail).subscribe();
          // Stop SignalR connection before clearing user data
          this.stopSignalRConnection();
          this.clearUserData();
          return true;
        }),
        catchError(() => {
          this.loadingSignal.set(false);
          this.authStateService.handleUserLogout(currentEmail).subscribe();
          // Stop SignalR connection even if logout API fails
          this.stopSignalRConnection();
          this.clearUserData();
          return of(true);
        })
      );
  }

  getCurrentUser(): Observable<UserDto | null> {
    this.loadingSignal.set(true);
    return this.http.get<UserDto>(`${this.baseUrl}/get-current-user`)
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          if (response) {
            this.setCurrentUser(response);
            return response;
          }
          return null;
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          return this.handleError<UserDto | null>('getCurrentUser', null)(error);
        })
      );
  }

  getUserAddress(): Observable<Address | null> {
    this.loadingSignal.set(true);
    return this.http.get<Address>(`${this.baseUrl}/address`)
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          return response;
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          return this.handleError<Address | null>('getUserAddress', null)(error);
        })
      );
  }

  updateAddress(address: Address): Observable<Address | null> {
    this.loadingSignal.set(true);
    return this.http.put<Address>(`${this.baseUrl}/address`, address)
      .pipe(
        map(response => {
          this.loadingSignal.set(false);
          const currentUser = this.currentUser();
          if (currentUser && response) {
            this.currentUserSignal.set({
              ...currentUser,
              address: response
            });
          }
          return response;
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          return this.handleError<Address | null>('updateAddress', null)(error);
        })
      );
  }

  private setCurrentUser(userDto: UserDto): void {
    const user: User = {
      firstName: userDto.userName.split(' ')[0] || userDto.userName,
      lastName: userDto.userName.split(' ')[1] || '',
      email: userDto.email,
      address: userDto.address || {} as Address,
    };

    this.currentUserSignal.set(user);
    this.tokenSignal.set(userDto.token);
  }

  private clearUserData(): void {
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);
  }

  // SignalR connection management methods
  private async startSignalRConnection(token: string): Promise<void> {
    try {
      await this.signalrService.createHubConnection(token);
    } catch (error) {
      console.error('Failed to start SignalR connection:', error);
    }
  }

  private async stopSignalRConnection(): Promise<void> {
    try {
      await this.signalrService.stopHubConnection();
    } catch (error) {
      console.error('Failed to stop SignalR connection:', error);
    }
  }

  public loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSignal.set(user);
        this.tokenSignal.set(token);
        this.startSignalRConnection(token);
      } catch (error) {
        this.clearUserData();
      }
    }
  }

  getCurrentUserValue(): User | null {
    return this.currentUser();
  }

  getTokenValue(): string | null {
    return this.token();
  }

  updateUserProfile(updates: Partial<User>): void {
    const currentUser = this.currentUser();
    if (currentUser) {
      this.currentUserSignal.set({ ...currentUser, ...updates });
    }
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return of(result as T);
    };
  }
}