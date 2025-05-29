import { Injectable, inject } from '@angular/core';
import { CartService } from './cart.service';
import { of, Observable } from 'rxjs';
import { Cart } from '../../Shared/models/Cart';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private cartService = inject(CartService);

  handleUserLogin(email: string): Observable<Cart | null> {
    const anonymousCartId = localStorage.getItem('cart_id');
    const userCartKey = `cart_${email}`;
    const userCartId = localStorage.getItem(userCartKey);

    if (anonymousCartId && !userCartId) {
      localStorage.setItem(userCartKey, anonymousCartId);
      localStorage.removeItem('cart_id');
      return this.cartService.getCart(anonymousCartId);
    } else if (userCartId) {
      if (anonymousCartId) {
        localStorage.removeItem('cart_id');
      }
      return this.cartService.getCart(userCartId);
    } else if (anonymousCartId) {
      return this.cartService.getCart(anonymousCartId);
    }
    
    return of(null);
  }

  handleUserLogout(email: string | null): Observable<null> {
    this.cartService.clearCart();
  
    localStorage.removeItem('cart_id');
    
    return of(null);
  }

  handleUserRegistration(email: string): Observable<Cart | null> {
    return this.handleUserLogin(email);
  }
}