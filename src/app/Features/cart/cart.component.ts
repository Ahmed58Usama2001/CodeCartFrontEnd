import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CartItemComponent } from './cart-item/cart-item.component';
import { CartService } from '../../Core/services/cart.service';
import { SnackbarService } from '../../Core/services/snackbar.service';
import { OrderSummaryComponent } from '../../Shared/components/order-summary/order-summary.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    CartItemComponent,
    OrderSummaryComponent
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private router = inject(Router);
  private snackBar = inject(SnackbarService);

  cart = this.cartService.cart;
  itemsCount = this.cartService.itemsCount;
  subtotal = this.cartService.subtotal;
  shipping = this.cartService.shipping;
  total = this.cartService.total;

  ngOnInit() {
    this.loadCart();
  }

  private loadCart() {
    const cartId = localStorage.getItem('cart_id');
    if (cartId) {
      this.cartService.getCart(cartId).subscribe({
        next: (cart) => {
          console.log('Cart loaded successfully', cart);
        },
        error: (error) => {
          console.error('Error loading cart:', error);
        }
      });
    }
  }

  continueShopping() {
    this.router.navigate(['/shop']); 
  }

  clearCart() {
    const cart = this.cart();
    if (cart && cart.items && cart.items.length > 0) {
        cart.items = [];
        this.cartService.setCart(cart);
        
        this.snackBar.success('Cart cleared successfully!');
    }
  }

  proceedToCheckout() {
    this.router.navigate(['/checkout']);
    console.log('Proceed to checkout clicked');
  }

  applyPromoCode(promoCode: string) {
    // Implement promo code logic
    console.log('Applying promo code:', promoCode);
    // You can add your promo code validation logic here
  }
}