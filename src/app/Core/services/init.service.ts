import { inject, Injectable } from '@angular/core';
import { CartService } from './cart.service';
import { AccountService } from './account.service';
import { of, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InitService {

  private cartService = inject(CartService);
  private accountService = inject(AccountService);

  init() {
    const currentUser = this.accountService.getCurrentUserValue();
    
    if (currentUser) {
      return this.loadUserCart(currentUser.email);
    } else {
      return this.loadAnonymousCart();
    }
  }

  private loadUserCart(userEmail: string) {
    const userCartKey = `cart_${userEmail}`;
    const cartId = localStorage.getItem(userCartKey);
    
    if (cartId) {
      return this.cartService.getCart(cartId);
    } else {
      return of(null);
    }
  }

  private loadAnonymousCart() {
    const cartId = localStorage.getItem('cart_id');
    
    if (cartId) {
      return this.cartService.getCart(cartId);
    } else {
      return of(null);
    }
  }

  handleUserLogin(userEmail: string) {
    const anonymousCartId = localStorage.getItem('cart_id');
    const userCartKey = `cart_${userEmail}`;
    
    if (anonymousCartId) {
      localStorage.setItem(userCartKey, anonymousCartId);
      localStorage.removeItem('cart_id');
      
      return this.cartService.getCart(anonymousCartId);
    } else {
      const userCartId = localStorage.getItem(userCartKey);
      if (userCartId) {
        return this.cartService.getCart(userCartId);
      }
    }
    
    return of(null);
  }

  handleUserLogout() {
    const currentUser = this.accountService.getCurrentUserValue();
    
    if (currentUser) {
      const userCartKey = `cart_${currentUser.email}`;
      const userCartId = localStorage.getItem(userCartKey);
      if (userCartId) {
        localStorage.removeItem('cart_id'); 
      }
    }
    
    this.cartService.clearCart();
    return of(null);
  }

  handleUserRegistration(userEmail: string) {
    return this.handleUserLogin(userEmail);
  }
}