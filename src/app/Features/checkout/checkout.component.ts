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
  
  subtotal = this.cartService.subtotal;
  shipping = this.cartService.shipping;
  total = this.cartService.total;

  ngOnInit() {
    console.log('Checkout component initialized');
  }

  ngAfterViewInit() {
    this.initializeAddressElement();
  }

  ngOnDestroy() {
    if (this.addressElement) {
      this.addressElement.destroy();
    }
    this.stripeService.disposeElements();
  }

  private async initializeAddressElement() {
    try {
      this.addressElement = await this.stripeService.createAddressElement();
      
      const addressElementDiv = document.getElementById('address-element');
      if (addressElementDiv && this.addressElement) {
        this.addressElement.mount('#address-element');
        
       
      }
    } catch (error) {
      console.error('Error initializing address element:', error);
    }
  }

  onDeliveryMethodSelected(deliveryMethod: DeliveryMethod) {
    console.log('Delivery method selected:', deliveryMethod);
    
    this.cartService.setDeliveryMethod(deliveryMethod);
    
    this.cartService.updateCartDeliveryMethod(deliveryMethod.id).subscribe({
      next: (updatedCart) => {
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
    
    if (previousIndex === 1 && selectedIndex === 2) {
      this.updatePaymentIntent();
    }
  }

  private updatePaymentIntent() {
    this.stripeService.CreateOrUpdatePaymentIntent().subscribe({
      next: (updatedCart) => {
      },
      error: (error) => {
        console.error('Error updating payment intent:', error);
      }
    });
  }

  applyPromoCode(promoCode: string) {
    console.log('Promo code applied:', promoCode);
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

  async validateAndProceedFromAddress() {
    try {
      const addressData = await this.getAddressData();
 
      this.stepper.next();
    } catch (error) {

    }
  }
}