// checkout.component.ts
import { Component, ViewChild, inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { StripeAddressElement } from '@stripe/stripe-js';

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
export class CheckoutComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;
  
  private cartService = inject(CartService);
  private stripeService = inject(StripeService);
  
  private addressElement?: StripeAddressElement;
  
  // Computed values from cart service - these will update automatically
  subtotal = this.cartService.subtotal;
  shipping = this.cartService.shipping;
  total = this.cartService.total;

  ngOnInit() {
    console.log('Checkout component initialized');
  }

  ngAfterViewInit() {
    // Initialize the address element after the view is ready
    this.initializeAddressElement();
  }

  ngOnDestroy() {
    // Clean up Stripe elements when component is destroyed
    if (this.addressElement) {
      this.addressElement.destroy();
    }
    this.stripeService.disposeElements();
  }

  private async initializeAddressElement() {
    try {
      // Create the address element
      this.addressElement = await this.stripeService.createAddressElement();
      
      // Mount it to the address-element div
      const addressElementDiv = document.getElementById('address-element');
      if (addressElementDiv && this.addressElement) {
        this.addressElement.mount('#address-element');
        
        // Optional: Listen for changes in the address element
        this.addressElement.on('change', (event) => {
          if (event.complete) {
            console.log('Address completed:', event.value);
            // You can store the address value or validate it here
          }
        });
      }
    } catch (error) {
      console.error('Error initializing address element:', error);
    }
  }

  onDeliveryMethodSelected(deliveryMethod: DeliveryMethod) {
    console.log('Delivery method selected:', deliveryMethod);
    
    // Update the selected delivery method in cart service
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
        console.log('Payment intent updated successfully:', updatedCart);
      },
      error: (error) => {
        console.error('Error updating payment intent:', error);
      }
    });
  }

  applyPromoCode(promoCode: string) {
    console.log('Promo code applied:', promoCode);
    // Add your promo code logic here
  }

  // Method to get address data when needed (e.g., before proceeding to next step)
  async getAddressData() {
    if (this.addressElement) {
      const { complete, value } = await this.addressElement.getValue();
      if (complete && value.address) {
        return value;
      } else {
        throw new Error('Address is incomplete');
      }
    }
    throw new Error('Address element not initialized');
  }

  // Method to validate address before moving to next step
  async validateAndProceedFromAddress() {
    try {
      const addressData = await this.getAddressData();
      console.log('Address data:', addressData);
      
      // You can save the address data to your service or perform validation here
      // For example, update the cart with the shipping address
      
      // Move to next step
      this.stepper.next();
    } catch (error) {
      console.error('Address validation failed:', error);
      // Show error message to user
    }
  }
}