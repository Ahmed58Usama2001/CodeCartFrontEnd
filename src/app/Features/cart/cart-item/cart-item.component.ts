import { Component, Input, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CartItem } from '../../../Shared/models/Cart';
import { CartService } from '../../../Core/services/cart.service';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.css'
})
export class CartItemComponent {
  @Input() item!: CartItem;
  @Output() itemUpdated = new EventEmitter<void>();
  @Output() itemRemoved = new EventEmitter<void>();

  private cartService = inject(CartService);

  increaseQuantity() {
    if (this.item.quantity < 99) {
      this.updateItemQuantity(this.item.quantity + 1);
    }
  }

  decreaseQuantity() {
    if (this.item.quantity > 1) {
      this.updateItemQuantity(this.item.quantity - 1);
    }
  }

  updateQuantity(event: Event) {
    const target = event.target as HTMLInputElement;
    const newQuantity = parseInt(target.value, 10);
    
    if (newQuantity && newQuantity > 0 && newQuantity <= 99) {
      this.updateItemQuantity(newQuantity);
    } else {
      target.value = this.item.quantity.toString();
    }
  }

  private updateItemQuantity(newQuantity: number) {
    const cart = this.cartService.cart();
    if (cart && cart.items) {
      const itemIndex = cart.items.findIndex(i => i.productId === this.item.productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = newQuantity;
        this.cartService.setCart(cart);
        this.itemUpdated.emit();
      }
    }
  }

  removeItem() {
    const cart = this.cartService.cart();
    if (cart && cart.items) {
      cart.items = cart.items.filter(i => i.productId !== this.item.productId);
      this.cartService.setCart(cart);
      this.itemRemoved.emit();
    }
  }

  getItemTotal(): number {
    return this.item.price * this.item.quantity;
  }
}