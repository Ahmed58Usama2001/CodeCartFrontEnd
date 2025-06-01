// checkout.component.ts
import { Component, ViewChild, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

import { CheckoutDeliveryComponent } from './checkout-delivery/checkout-delivery.component';
import { OrderSummaryComponent } from '../../Shared/components/order-summary/order-summary.component';
import { CartService } from '../../Core/services/cart.service';
import { StripeService } from '../../Core/services/stripe.service';

export interface DeliveryMethod {
  shortName: string;
  deliveryTime: string;
  description: string;
  price: number;
  id: number;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    CheckoutDeliveryComponent,
    OrderSummaryComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  
  private cartService = inject(CartService);
  private stripeService = inject(StripeService);
  
  // Computed values from cart service - these will update automatically
  subtotal = this.cartService.subtotal;
  shipping = this.cartService.shipping;
  total = this.cartService.total;

  ngOnInit() {
    // Payment intent is already initialized when entering checkout (for address step)
    console.log('Checkout component initialized');
  }

  onDeliveryMethodSelected(deliveryMethod: DeliveryMethod) {
    console.log('Delivery method selected:', deliveryMethod);
    
    // Update the selected delivery method in cart service
    // This will automatically update the shipping cost in order summary
    this.cartService.setDeliveryMethod(deliveryMethod);
    
    // Update the cart on the backend with the new delivery method
    this.cartService.updateCartDeliveryMethod(deliveryMethod.id).subscribe({
      next: (updatedCart) => {
        console.log('Delivery method updated in cart:', updatedCart);
      },
      error: (error) => {
        console.error('Error updating delivery method:', error);
      }
    });
  }

  onStepperSelectionChange(event: any) {
    const selectedIndex = event.selectedIndex;
    const previousIndex = event.previouslySelectedIndex;
    
    console.log(`Stepper changed from ${previousIndex} to ${selectedIndex}`);
    
    // Check if moving from step 1 (Shipping) to step 2 (Payment)
    if (previousIndex === 1 && selectedIndex === 2) {
      console.log('Moving from Shipping to Payment - updating payment intent');
      this.updatePaymentIntent();
    }
  }

  private updatePaymentIntent() {
    // Update the payment intent to reflect the new total with shipping
    this.stripeService.CreateOrUpdatePaymentIntent().subscribe({
      next: (updatedCart) => {
        console.log('Payment intent updated successfully:', updatedCart);},
      error: (error) => {
        console.error('Error updating payment intent:', error);
      }
    });
  }

  applyPromoCode(promoCode: string) {
    // Handle promo code application
    console.log('Promo code applied:', promoCode);
    // Add your promo code logic here
  }
}