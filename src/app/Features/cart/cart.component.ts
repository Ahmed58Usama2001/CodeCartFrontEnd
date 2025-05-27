import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CartItemComponent } from './cart-item/cart-item.component';
import { CartService } from '../../Core/services/cart.service';
import { SnackbarService } from '../../Core/services/snackbar.service';


@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    CartItemComponent
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

  subtotal = computed(() => {
    const cart = this.cart();
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  });

  tax = computed(() => {
    return this.subtotal() * 0.08; 
  });

  shipping = computed(() => {
    const subtotal = this.subtotal();
    return subtotal > 0 ? (subtotal > 50 ? 0 : 5.99) : 0; 
  });

  total = computed(() => {
    return this.subtotal() + this.tax() + this.shipping();
  });

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

  calculateSubtotal(): number {
    return this.subtotal();
  }

  calculateTax(): number {
    return this.tax();
  }

  calculateTotal(): number {
    return this.total();
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
    // Navigate to checkout page
    // You can inject Router and navigate
    console.log('Proceed to checkout clicked');
  }

  applyPromoCode(promoCode: string) {
    // Implement promo code logic
    console.log('Applying promo code:', promoCode);
  }
}