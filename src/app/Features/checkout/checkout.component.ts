import { Component, computed, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CheckoutDeliveryComponent } from './checkout-delivery/checkout-delivery.component';
import { OrderSummaryComponent } from '../../Shared/components/order-summary/order-summary.component';
import { StripeAddressElement } from '@stripe/stripe-js';
import { CartService } from '../../Core/services/cart.service';
import { SnackbarService } from '../../Core/services/snackbar.service';
import { StripeService } from '../../Core/services/stripe.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    CheckoutDeliveryComponent,
    OrderSummaryComponent,MatButton,
    RouterLink
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit, OnDestroy {

  private stripeService = inject(StripeService);
  private snackBarService = inject(SnackbarService);
    private cartService = inject(CartService);
  cart = this.cartService.cart;
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
  addressElement?: StripeAddressElement;




     async ngOnInit() {
    try {
      this.addressElement = await this.stripeService.createAddressElement();
      this.addressElement?.mount('#address-element');
    } catch (error:any) {
      this.snackBarService.error(error.message || 'Failed to initialize address element');
    }
  }
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }



    applyPromoCode(promoCode: string) {
    // Implement promo code logic
    console.log('Applying promo code:', promoCode);
    // You can add your promo code validation logic here
  }
}
