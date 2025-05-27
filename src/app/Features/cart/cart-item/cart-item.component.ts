import { Component, Input, inject, Output, EventEmitter, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CartItem } from '../../../Shared/models/Cart';
import { CartService } from '../../../Core/services/cart.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    RouterLink
  ],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.css'
})
export class CartItemComponent {
  item=input.required<CartItem>();

  private cartService = inject(CartService);

  increaseQuantity() {
    this.cartService.addItemToCart(this.item());
  }

  decreaseQuantity() {
    this.cartService.removeItemFromCart(this.item().productId);
  }


  removeItemFromCart() {
    this.cartService.removeItemFromCart(this.item().productId,this.item().quantity);
  }

  getItemTotal(): number {
    return this.item().price * this.item().quantity;
  }
}