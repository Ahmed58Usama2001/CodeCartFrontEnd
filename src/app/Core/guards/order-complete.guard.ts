import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { OrderService } from '../services/order.service';

export const orderCompleteGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const orderService = inject(OrderService);

  if(orderService.orderComplete) {
    return true;
  }
  else{
    router.navigate(['/shop']);
    return false;
  }
};
