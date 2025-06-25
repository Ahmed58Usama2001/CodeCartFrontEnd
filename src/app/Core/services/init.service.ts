import { inject, Injectable } from '@angular/core';
import { CartService } from './cart.service';
import { AccountService } from './account.service';
import { of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InitService {
  private cartService = inject(CartService);
  private accountService = inject(AccountService);

  init() {
    this.accountService.loadUserFromStorage();
    
    const currentUser = this.accountService.getCurrentUserValue();
    const cartId = currentUser 
      ? localStorage.getItem(`cart_${currentUser.email}`)
      : localStorage.getItem('cart_id');
    
    if (cartId) {
      return this.cartService.getCart(cartId).pipe(
        tap(cart => {
          if (cart) {
            this.cartService.cart.set(cart);
          }
        })
      );
    }
    return of(null);
  }
}