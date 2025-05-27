import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Cart, CartItem } from '../../Shared/models/Cart';
import { Product } from '../../Shared/models/Product';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  baseUrl = environment.apiUrl;

  private http = inject(HttpClient)

  cart = signal<Cart | null>(null);

  getCart(id:string) {
    return this.http.get<Cart>(this.baseUrl + 'cart?id=' + id).subscribe({
      next: (cart) => {
        this.cart.set(cart);
      },
      error: (error) => {
        console.error('Error fetching cart:', error);
      }
    });
  }

  setCart(cart: Cart) {
    return this.http.post<Cart>(this.baseUrl + 'cart', cart).subscribe({
      next: (cart) => {
        this.cart.set(cart);
      },
      error: (error) => {
        console.error('Error setting cart:', error);
      }
    });
  }

  addItemToCart(item:CartItem|Product , quantity:number=1){
    const cart = this.cart()??this.createEmptyCart();

    if(this.isProduct(item))
      item = this.mapProductToCartItem(item);
    
    cart.items = this.addOrUpdateItem(cart.items,item, quantity);
    this.setCart(cart);
  }

  private createEmptyCart(): Cart {
    const cart = new Cart();
    localStorage.setItem('cart_id', cart.id);
    return cart;
  }

  private isProduct(item: CartItem | Product): item is Product {
    return (item as Product).id !== undefined;
  }

  private mapProductToCartItem(item: Product):CartItem {
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

    private addOrUpdateItem(items:CartItem[],item: CartItem, quantity: number): CartItem[] {
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
