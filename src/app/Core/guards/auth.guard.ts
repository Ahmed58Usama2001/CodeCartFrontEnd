import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../services/account.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {

  const accountService = inject(AccountService);
  const router = inject(Router);

  if (accountService.currentUser())
    return true;
  else {
    router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};
