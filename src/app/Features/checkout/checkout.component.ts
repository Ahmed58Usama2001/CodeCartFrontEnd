// checkout.component.ts
import { Component, ViewChild, inject, OnInit, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { StripeAddressElement, StripePaymentElement } from '@stripe/stripe-js';

import { CheckoutDeliveryComponent } from './checkout-delivery/checkout-delivery.component';
import { OrderSummaryComponent } from '../../Shared/components/order-summary/order-summary.component';
import { CartService } from '../../Core/services/cart.service';
import { StripeService } from '../../Core/services/stripe.service';
import { CheckoutReviewComponent } from "./checkout-review/checkout-review.component";

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
    OrderSummaryComponent,
    CheckoutReviewComponent
],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements AfterViewInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;
  
  private cartService = inject(CartService);
  private stripeService = inject(StripeService);
  
  private addressElement?: StripeAddressElement;
  private paymentElement?: StripePaymentElement;
  
  subtotal = this.cartService.subtotal;
  shipping = this.cartService.shipping;
  total = this.cartService.total;

  completionStatus = signal<{address: boolean, delivery: boolean, card: boolean}>({
    address: false,
    delivery: false,
    card: false
  });

  // Error messages for validation
  validationErrors = signal<{address: string, delivery: string, card: string}>({
    address: '',
    delivery: '',
    card: ''
  });

  ngAfterViewInit() {
    this.initializeAddressElement();
  }

  ngOnDestroy() {
    if (this.addressElement) {
      this.addressElement.destroy();
    }
    if (this.paymentElement) {
      this.paymentElement.destroy();
    }
    this.stripeService.disposeElements();
  }

  private async initializeAddressElement() {
    try {
      this.addressElement = await this.stripeService.createAddressElement();
      
      const addressElementDiv = document.getElementById('address-element');
      if (addressElementDiv && this.addressElement) {
        this.addressElement.mount('#address-element');
        
        this.addressElement.on('change', (event) => {
          // Update completion status based on address completion
          this.completionStatus.update(status => ({
            ...status,
            address: event.complete
          }));
          
          // Clear validation error if address is complete
          if (event.complete) {
            this.validationErrors.update(errors => ({
              ...errors,
              address: ''
            }));
          }
          
          console.log('Address completed:', event.complete, event.value);
        });
      }
    } catch (error) {
      console.error('Error initializing address element:', error);
    }
  }

  onDeliveryMethodSelected(deliveryMethod: DeliveryMethod) {
    console.log('Delivery method selected:', deliveryMethod);
    
    this.cartService.setDeliveryMethod(deliveryMethod);
    
    // Mark delivery as completed when a method is selected
    this.completionStatus.update(status => ({
      ...status,
      delivery: true
    }));

    // Clear delivery validation error
    this.validationErrors.update(errors => ({
      ...errors,
      delivery: ''
    }));
    
    this.cartService.updateCartDeliveryMethod(deliveryMethod.id).subscribe({
      next: (updatedCart) => {
        console.log('Delivery method updated in cart:', updatedCart);
      },
      error: (error) => {
        console.error('Error updating delivery method:', error);
        // Reset delivery completion on error
        this.completionStatus.update(status => ({
          ...status,
          delivery: false
        }));
      }
    });
  }

  onStepperSelectionChange(event: any) {
    const selectedIndex = event.selectedIndex;
    const previousIndex = event.previouslySelectedIndex;
    
    console.log(`Stepper changed from ${previousIndex} to ${selectedIndex}`);
    
    if (selectedIndex === 2 && !this.paymentElement) {
      this.initializePaymentElement();
    }
    
    if (previousIndex === 1 && selectedIndex === 2) {
      console.log('Moving from Shipping to Payment - updating payment intent');
      this.updatePaymentIntent();
    }
  }

  private updatePaymentIntent() {
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

  private async initializePaymentElement() {
    try {
      this.paymentElement = await this.stripeService.createPaymentElement();
      
      const paymentElementDiv = document.getElementById('payment-element');
      if (paymentElementDiv && this.paymentElement) {
        this.paymentElement.mount('#payment-element');
        
        // Listen for changes in the payment element
        this.paymentElement.on('change', (event) => {
          this.completionStatus.update(status => ({
            ...status,
            card: event.complete
          }));
          
          if (event.complete) {
            this.validationErrors.update(errors => ({
              ...errors,
              card: ''
            }));
          }
        });
      }
    } catch (error) {
      console.error('Error initializing payment element:', error);
    }
  }

  async processPayment() {
    try {
      if (!this.paymentElement) {
        throw new Error('Payment element not initialized');
      }

      const result = await this.stripeService.confirmPayment(window.location.origin + '/checkout/success');
      
      if (result.status === 'succeeded') {
        console.log('Payment succeeded!', result);
        this.stepper.next();
      } else {
        console.log('Payment status:', result.status);
      }
    } catch (error) {
      console.error('Payment failed:', error);
      // Show error message to user
    }
  }

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
      
      this.completionStatus.update(status => ({
        ...status,
        address: true
      }));

      this.validationErrors.update(errors => ({
        ...errors,
        address: ''
      }));
      
      // Move to next step
      this.stepper.next();
    } catch (error) {
      console.error('Address validation failed:', error);
      
      this.completionStatus.update(status => ({
        ...status,
        address: false
      }));

      this.validationErrors.update(errors => ({
        ...errors,
        address: 'Please complete your address information'
      }));
    }
  }

  // Method to validate delivery before moving to next step
  validateAndProceedFromDelivery() {
    if (this.completionStatus().delivery) {
      this.validationErrors.update(errors => ({
        ...errors,
        delivery: ''
      }));
      this.stepper.next();
    } else {
      this.validationErrors.update(errors => ({
        ...errors,
        delivery: 'Please select a delivery method'
      }));
    }
  }

  // Method to validate payment before processing
  async validateAndProcessPayment() {
    if (this.completionStatus().card) {
      this.validationErrors.update(errors => ({
        ...errors,
        card: ''
      }));
      await this.processPayment();
    } else {
      this.validationErrors.update(errors => ({
        ...errors,
        card: 'Please complete your payment information'
      }));
    }
  }

  // Check if a step can be accessed
  canAccessStep(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0: // Address step
        return true;
      case 1: // Delivery step
        return this.completionStatus().address;
      case 2: // Payment step
        return this.completionStatus().address && this.completionStatus().delivery;
      case 3: // Confirmation step
        return this.completionStatus().address && this.completionStatus().delivery && this.completionStatus().card;
      default:
        return false;
    }
  }
}