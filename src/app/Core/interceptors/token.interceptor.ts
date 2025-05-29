import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AccountService } from '../services/account.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const accountService = inject(AccountService);
  
  const token = accountService.getTokenValue();
  
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && accountService.getRefreshTokenValue()) {
        return handle401Error(authReq, next, accountService);
      }
      
      return throwError(() => error);
    })
  );
};

function handle401Error(
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn, 
  accountService: AccountService
): Observable<HttpEvent<unknown>> {
  const refreshToken = accountService.getRefreshTokenValue();
  
  if (!refreshToken) {
    accountService.logout().subscribe();
    return throwError(() => new Error('No refresh token available'));
  }

  return accountService.refreshTokenMethod(refreshToken).pipe(
    switchMap((newTokenData) => {
      if (newTokenData) {
        const newAuthReq = request.clone({
          setHeaders: {
            Authorization: `Bearer ${newTokenData.token}`
          }
        });
        return next(newAuthReq);
      } else {
        accountService.logout().subscribe();
        return throwError(() => new Error('Token refresh failed'));
      }
    }),
    catchError((error) => {
      accountService.logout().subscribe();
      return throwError(() => error);
    })
  );
}