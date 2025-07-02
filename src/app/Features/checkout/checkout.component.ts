// checkout.component.ts
import { Component, ViewChild, inject, OnInit, AfterViewInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { ConfirmationToken, StripeAddressElement, StripePaymentElement } from '@stripe/stripe-js';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CheckoutDeliveryComponent } from './checkout-delivery/checkout-delivery.component';
import { OrderSummaryComponent } from '../../Shared/components/order-summary/order-summary.component';
import { CartService } from '../../Core/services/cart.service';
import { StripeService } from '../../Core/services/stripe.service';
import { CheckoutReviewComponent } from "./checkout-review/checkout-review.component";
import { SnackbarService } from '../../Core/services/snackbar.service';
import { OrderToCreate, ShippingAddress } from '../../Shared/models/Order';
import { OrderService } from '../../Core/services/order.service';
import { firstValueFrom } from 'rxjs';

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
    CheckoutReviewComponent,
    MatProgressSpinnerModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements AfterViewInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  private cartService = inject(CartService);
  private stripeService = inject(StripeService);
  private orderService = inject(OrderService);
  private SnackbarService = inject(SnackbarService);
  private router = inject(Router);

  private addressElement?: StripeAddressElement;
  private paymentElement?: StripePaymentElement;

  subtotal = this.cartService.subtotal;
  shipping = this.cartService.shipping;
  total = this.cartService.total;

  completionStatus = signal<{ address: boolean, delivery: boolean, card: boolean }>({
    address: false,
    delivery: false,
    card: false
  });

  confirmationToken?: ConfirmationToken
  loading = false

  validationErrors = signal<{ address: string, delivery: string, card: string }>({
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
          this.completionStatus.update(status => ({
            ...status,
            address: event.complete
          }));

          if (event.complete) {
            this.validationErrors.update(errors => ({
              ...errors,
              address: ''
            }));
          }

        });
      }
    } catch (error) {
      console.error('Error initializing address element:', error);
    }
  }

  onDeliveryMethodSelected(deliveryMethod: DeliveryMethod) {

    this.cartService.setDeliveryMethod(deliveryMethod);

    this.completionStatus.update(status => ({
      ...status,
      delivery: true
    }));

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
        this.completionStatus.update(status => ({
          ...status,
          delivery: false
        }));
      }
    });
  }

  async getConfirmationToken() {
    if (Object.values(this.completionStatus()).every(status => status)) {
      try {
        const result = await this.stripeService.CreateConfirmationToken();
        if (result.error)
          throw new Error(result.error.message || 'Failed to create confirmation token');
        this.confirmationToken = result.confirmationToken;
        console.log('Confirmation token received:', this.confirmationToken);


      } catch (error: any) {
        this.SnackbarService.error(error.message || 'Failed to get confirmation token');
      }
    }
  }

  async onStepperSelectionChange(event: any) {
    const selectedIndex = event.selectedIndex;
    const previousIndex = event.previouslySelectedIndex;


    if (selectedIndex === 2 && !this.paymentElement) {
      this.initializePaymentElement();
    }

    if (previousIndex === 1 && selectedIndex === 2) {
      console.log('Moving from Shipping to Payment - updating payment intent');
      this.updatePaymentIntent();
    }

    if (selectedIndex === 3)
      await this.getConfirmationToken();
  }

  async ConfirmPayment(stepper: MatStepper) {
    this.loading = true
    try {
      if (this.confirmationToken) {
        const result = await this.stripeService.ConfirmPayment(this.confirmationToken);

        if (result.paymentIntent?.status == 'succeeded') {
          const order = await this.CreateOrderModel();
          const orderResult = await firstValueFrom(this.orderService.CreateOrder(order));
          if (orderResult) {
            this.orderService.orderComplete = true;
            this.cartService.deleteCart()
            this.cartService.selectedDeliveryMethod.set(null)
            this.router.navigate(['/checkout/success']);
          } else {
            throw new Error('Failed to create order');
          }
        } else if (result.error) {
          throw new Error(result.error.message || 'Failed to confirm payment');
        }
        else
          throw new Error('Something went wrong with the payment confirmation');

      }
    } catch (error: any) {
      this.SnackbarService.error(error.message || 'Failed to confirm payment');
      stepper.previous();
    } finally {
      this.loading = false
    }

  }

  private async CreateOrderModel(): Promise<OrderToCreate> {
    const cart = this.cartService.cart();
    const addressData = await this.getAddressData();
    const shippingAddress: ShippingAddress = {
      name: addressData.name,
      line1: addressData.address.line1,
      line2: addressData.address.line2 || undefined,
      city: addressData.address.city,
      postalCode: addressData.address.postal_code,
      state: addressData.address.state,
      country: addressData.address.country
    };
    const card = this.confirmationToken?.payment_method_preview.card;

    if (!cart?.id || !cart.deliveryMethodId || !card || !shippingAddress) {
      throw new Error('Problem creating order');
    }

    return {
      cartId: cart.id,
      paymentSummary: {
        last4: +card.last4,
        brand: card.brand,
        expMonth: card.exp_month,
        expYear: card.exp_year
      },
      shippingAddress,
      deliveryMethodId: cart.deliveryMethodId
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


  canAccessStep(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0:
        return true;
      case 1:
        return this.completionStatus().address;
      case 2:
        return this.completionStatus().address && this.completionStatus().delivery;
      case 3:
        return this.completionStatus().address && this.completionStatus().delivery && this.completionStatus().card;
      default:
        return false;
    }
  }


}