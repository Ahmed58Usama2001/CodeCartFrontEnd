import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
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
      // If we get a 401 error, logout the user
      if (error.status === 401) {
        accountService.logout().subscribe();
      }
      
      return throwError(() => error);
    })
  );
};