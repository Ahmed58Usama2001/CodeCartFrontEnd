import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Address, FacebookSignInVM, ForgetPasswordDto, GoogleSignInVM, LoginDto, RefreshTokenDto, RegisterDto, ResetPasswordDto, User, UserDto } from '../../Shared/models/User';
import { environment } from '../../../environments/environment.development';
import { InitService } from './init.service';



declare const google: any;
declare interface FB {
  init(params: {
    appId: string;
    cookie?: boolean;
    xfbml?: boolean;
    version: string;
  }): void;
  login(
    callback: (response: any) => void,
    options?: { scope: string }
  ): void;
}

declare const FB: FB;

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private baseUrl = environment.apiUrl+'account';

  private initService = inject(InitService);

  
  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);
  private refreshTokenSignal = signal<string | null>(null);
  private loadingSignal = signal<boolean>(false);
  private googleLoadedSignal = signal<boolean>(false);
  private facebookLoadedSignal = signal<boolean>(false);
  
  public readonly currentUser = this.currentUserSignal.asReadonly();
  public readonly token = this.tokenSignal.asReadonly();
  public readonly refreshToken = this.refreshTokenSignal.asReadonly();
  public readonly loading = this.loadingSignal.asReadonly();
  public readonly googleLoaded = this.googleLoadedSignal.asReadonly();
  public readonly facebookLoaded = this.facebookLoadedSignal.asReadonly();
  
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

  private readonly GOOGLE_CLIENT_ID = '506561950668-4spnm54ip1dm28aeans61c8d312bme9q.apps.googleusercontent.com';
  private readonly FACEBOOK_APP_ID = '1105757407206150';

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
    
    effect(() => {
      const user = this.currentUser();
      const token = this.token();
      const refreshToken = this.refreshToken();
      
      if (user && token && refreshToken) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
      } else {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    });

    this.initializeGoogleSDK();
    this.initializeFacebookSDK();
  }

 register(registerData: RegisterDto): Observable<UserDto | null> {
  this.loadingSignal.set(true);
  return this.http.post<UserDto>(`${this.baseUrl}/register`, registerData)
    .pipe(
      map(response => {
        this.loadingSignal.set(false);
        if (response && response.token) {
          this.setCurrentUser(response);
          this.initService.handleUserRegistration(response.email);
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
          this.initService.handleUserLogin(response.email);
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

  googleSignIn(googleData: GoogleSignInVM): Observable<UserDto | null> {
  this.loadingSignal.set(true);
  return this.http.post<UserDto>(`${this.baseUrl}/GoogleSignIn`, googleData)
    .pipe(
      map(response => {
        this.loadingSignal.set(false);
        if (response && response.token) {
          this.setCurrentUser(response);
          this.initService.handleUserLogin(response.email);
          return response;
        }
        return null;
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        return this.handleError<UserDto | null>('googleSignIn', null)(error);
      })
    );
}

facebookSignIn(facebookData: FacebookSignInVM): Observable<UserDto | null> {
  this.loadingSignal.set(true);
  return this.http.post<UserDto>(`${this.baseUrl}/FacebookSignIn`, facebookData)
    .pipe(
      map(response => {
        this.loadingSignal.set(false);
        if (response && response.token) {
          this.setCurrentUser(response);
          this.initService.handleUserLogin(response.email);
          return response;
        }
        return null;
      }),
      catchError(error => {
        this.loadingSignal.set(false);
        return this.handleError<UserDto | null>('facebookSignIn', null)(error);
      })
    );
}

logout(): Observable<any> {
  this.loadingSignal.set(true);
  return this.http.post(`${this.baseUrl}/logout`, {})
    .pipe(
      map(() => {
        this.loadingSignal.set(false);
        this.initService.handleUserLogout().subscribe();
        this.clearUserData();
        return true;
      }),
      catchError(() => {
        this.loadingSignal.set(false);
        this.initService.handleUserLogout().subscribe();
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

  forgetPassword(email: string): Observable<boolean> {
    this.loadingSignal.set(true);
    const forgetPasswordData: ForgetPasswordDto = { email };
    return this.http.post<ForgetPasswordDto>(`${this.baseUrl}/forgetPassword`, forgetPasswordData)
      .pipe(
        map(() => {
          this.loadingSignal.set(false);
          return true;
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          return this.handleError<boolean>('forgetPassword', false)(error);
        })
      );
  }

  resetPassword(resetData: ResetPasswordDto): Observable<boolean> {
    this.loadingSignal.set(true);
    return this.http.post<ResetPasswordDto>(`${this.baseUrl}/ResetPassword`, resetData)
      .pipe(
        map(() => {
          this.loadingSignal.set(false);
          return true;
        }),
        catchError(error => {
          this.loadingSignal.set(false);
          return this.handleError<boolean>('resetPassword', false)(error);
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

  updateUserAddress(address: Address): Observable<Address | null> {
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
          return this.handleError<Address | null>('updateUserAddress', null)(error);
        })
      );
  }

  initializeGoogleSDK(): void {
    if (typeof google !== 'undefined' && google.accounts) {
      this.googleLoadedSignal.set(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      google.accounts.id.initialize({
        client_id: this.GOOGLE_CLIENT_ID
      });
      this.googleLoadedSignal.set(true);
    };
    script.onerror = () => {
      console.error('Failed to load Google SDK');
    };
    document.head.appendChild(script);
  }

  private initializeFacebookSDK(): void {
    if (typeof window !== 'undefined' && (window as any).FB) {
      this.facebookLoadedSignal.set(true);
      return;
    }

    (window as any).fbAsyncInit = () => {
      FB.init({
        appId: this.FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v19.0'
      });
      this.facebookLoadedSignal.set(true);
    };

    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error('Failed to load Facebook SDK');
    };
    document.head.appendChild(script);
}

  triggerGoogleSignIn(callback: (response: any) => void): void {
    if (!this.googleLoaded()) {
      console.error('Google SDK not loaded yet');
      return;
    }

    google.accounts.id.initialize({
      client_id: this.GOOGLE_CLIENT_ID,
      callback: callback
    });
    google.accounts.id.prompt();
  }

  triggerFacebookSignIn(callback: (response: any) => void): void {
    if (!this.facebookLoaded()) {
      console.error('Facebook SDK not loaded yet');
      return;
    }

    FB.login(callback, { scope: 'email' });
  }

  handleGoogleSignInResponse(response: any): Observable<UserDto | null> {
    const googleData: GoogleSignInVM = {
      idToken: response.credential,
      clientId: this.GOOGLE_CLIENT_ID
    };

    return this.googleSignIn(googleData);
  }

  handleFacebookSignInResponse(response: any): Observable<UserDto | null> {
    if (response.authResponse) {
      const facebookData: FacebookSignInVM = {
        accessToken: response.authResponse.accessToken
      };
      return this.facebookSignIn(facebookData);
    }
    return of(null);
  }

  private setCurrentUser(userDto: UserDto): void {
    const user: User = {
      firstName: userDto.userName.split(' ')[0] || userDto.userName,
      lastName: userDto.userName.split(' ')[1] || '',
      email: userDto.email,
      address: userDto.address || {} as Address
    };

    this.currentUserSignal.set(user);
    this.tokenSignal.set(userDto.token);
    this.refreshTokenSignal.set(userDto.refreshToken);
  }

  private clearUserData(): void {
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);
    this.refreshTokenSignal.set(null);
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const userStr = localStorage.getItem('user');
    
    if (token && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSignal.set(user);
        this.tokenSignal.set(token);
        this.refreshTokenSignal.set(refreshToken);
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

  getRefreshTokenValue(): string | null {
    return this.refreshToken();
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