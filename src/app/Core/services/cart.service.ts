import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Cart, CartItem } from '../../Shared/models/Cart';
import { Product } from '../../Shared/models/Product';
import { map, tap } from 'rxjs';
import { DeliveryMethod } from '../../Shared/models/deliveryMethod';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  baseUrl = environment.apiUrl;

  private http = inject(HttpClient);

  selectedDeliveryMethod = signal<DeliveryMethod | null>(null);
  cart = signal<Cart | null>(null);
  itemsCount = computed(() => {
    const cart = this.cart();
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  });

  getCart(id: string) {
    return this.http.get<Cart>(this.baseUrl + 'cart?id=' + id).pipe(
      map(cart => {
        this.cart.set(cart);
        return cart;
      })
    );
  }

  setCart(cart: Cart) {
    return this.http.post<Cart>(this.baseUrl + 'cart', cart).subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.updateCartStorage(cart.id);
      },
      error: (error) => {
        console.error('Error setting cart:', error);
      }
    });
  }

  deleteCart() {
    const cartId = this.cart()?.id;
    if (!cartId) return;
    
    return this.http.delete(this.baseUrl + 'cart?id=' + cartId).subscribe({
      next: () => {
        this.cart.set(null);
        this.removeCartFromStorage();
      },
      error: (error) => {
        console.error('Error deleting cart:', error);
      }
    });
  }

  clearCart() {
    this.cart.set(null);
  }

  addItemToCart(item: CartItem | Product, quantity: number = 1) {
    const cart = this.cart() ?? this.createEmptyCart();

    if (this.isProduct(item))
      item = this.mapProductToCartItem(item);

    cart.items = this.addOrUpdateItem(cart.items, item, quantity);
    this.setCart(cart);
  }

  removeItemFromCart(productId: number, quantity: number = 1) {
    const cart = this.cart();
    if (!cart || !cart.items) return;
    const index = cart.items.findIndex(i => i.productId === productId);
    if (index > -1) {
      cart.items[index].quantity -= quantity;
      if (cart.items[index].quantity <= 0) {
        cart.items.splice(index, 1);
      }
      if (cart.items.length === 0) {
        this.deleteCart();
      }
      else {
        this.setCart(cart);
      }
    }
  }

  private createEmptyCart(): Cart {
    const cart = new Cart();
    this.updateCartStorage(cart.id);
    return cart;
  }

  private updateCartStorage(cartId: string) {
    const userStr = localStorage.getItem('user');
    let currentUser = null;
    
    if (userStr) {
      try {
        currentUser = JSON.parse(userStr);
      } catch (error) {
        currentUser = null;
      }
    }
    
    if (currentUser?.email) {
     localStorage.setItem(`cart_${currentUser.email}`, cartId);
      localStorage.removeItem('cart_id');
    } else {
      localStorage.setItem('cart_id', cartId);
    }
  }

  private removeCartFromStorage() {
    const userStr = localStorage.getItem('user');
    let currentUser = null;
    
    if (userStr) {
      try {
        currentUser = JSON.parse(userStr);
      } catch (error) {
        currentUser = null;
      }
    }
    
    if (currentUser?.email) {
      localStorage.removeItem(`cart_${currentUser.email}`);
    } else {
      localStorage.removeItem('cart_id');
    }
  }

  private isProduct(item: CartItem | Product): item is Product {
    return (item as Product).id !== undefined;
  }

  private mapProductToCartItem(item: Product): CartItem {
    return {
      productId: item.id,
      productName: item.name,
      price: item.price,
      pictureUrl: item.pictureUrl,
      brand: item.brand,
      type: item.type,
      quantity: 0
    } as CartItem;
  }

  private addOrUpdateItem(items: CartItem[], item: CartItem, quantity: number): CartItem[] {
    const existingItemIndex = items.findIndex(i => i.productId === item.productId);
    if (existingItemIndex > -1) {
      items[existingItemIndex].quantity += quantity;
      if (items[existingItemIndex].quantity <= 0) {
        items.splice(existingItemIndex, 1);
      }
    } else {
      item.quantity = quantity;
      items.push(item);
    }

    return items;
  }
}