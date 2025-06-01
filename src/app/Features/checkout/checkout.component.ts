import { Component, computed, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatStepperModule, MatStepper } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { StripeService } from '../../Core/services/stripe.service';
import { StripeAddressElement } from '@stripe/stripe-js';
import { SnackbarService } from '../../Core/services/snackbar.service';
import { CartService } from '../../Core/services/cart.service';
import { OrderSummaryComponent } from '../../Shared/components/order-summary/order-summary.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    OrderSummaryComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit, OnDestroy {
  @ViewChild('stepper') stepper!: MatStepper;

  private stripeService = inject(StripeService);
  private snackBar = inject(SnackbarService);
  private cartService = inject(CartService);
  private fb = inject(FormBuilder);

  addressElement?: StripeAddressElement;
  addressForm: FormGroup;
  addressError: string = '';
  addressLoading: boolean = false;
  orderProcessing: boolean = false;

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

  constructor() {
    this.addressForm = this.fb.group({
      addressComplete: [false, Validators.requiredTrue]
    });
  }

  async ngOnInit() {
    try {
      this.addressElement = await this.stripeService.createAddressElement();
      this.addressElement.mount('#address-element');

      this.addressElement.on('change', (event) => {
        this.addressError = '';
        this.addressForm.patchValue({
          addressComplete: event.complete
        });
      });

    } catch (error: any) {
      this.snackBar.error(error.message || 'Failed to initialize address element');
    }
  }

  ngOnDestroy(): void {
    this.stripeService.disposeElements();
  }

  async validateAddressAndNext() {
    if (!this.addressElement) {
      this.snackBar.error('Address element not initialized');
      return;
    }

    this.addressLoading = true;
    this.addressError = '';

    try {
      const result = await this.addressElement.getValue();
      
      if (!result.complete) {
        this.addressError = 'Please complete the address form';
        this.addressLoading = false;
        return;
      }

      this.stepper.next();
      this.addressLoading = false;

      this.updateAddressPreview(result.value);

    } catch (error: any) {
      this.addressError = error.message || 'Failed to validate address';
      this.addressLoading = false;
    }
  }

  private updateAddressPreview(addressValue: any) {
    const previewElement = document.getElementById('address-preview');
    if (previewElement && addressValue.address) {
      const address = addressValue.address;
      previewElement.innerHTML = `
        <div>
          <strong>${addressValue.name}</strong><br>
          ${address.line1}<br>
          ${address.line2 ? address.line2 + '<br>' : ''}
          ${address.city}, ${address.state} ${address.postal_code}<br>
          ${address.country}
        </div>
      `;
    }
  }

  async placeOrder() {
    this.orderProcessing = true;
    
    try {
      // Here you would implement the actual order placement logic
      // This would typically involve:
      // 1. Creating the payment intent
      // 2. Confirming the payment with Stripe
      // 3. Sending order data to your backend
      // 4. Handling the response
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      this.snackBar.success('Order placed successfully!');
      this.orderProcessing = false;
      
      // Navigate to order confirmation page or show success message
      
    } catch (error: any) {
      this.snackBar.error(error.message || 'Failed to place order');
      this.orderProcessing = false;
    }
  }

  applyPromoCode(promoCode: string) {
    // Implement promo code logic
    console.log('Applying promo code:', promoCode);
    this.snackBar.success(`Promo code "${promoCode}" applied!`);
  }

  goToStep(stepIndex: number) {
    this.stepper.selectedIndex = stepIndex;
  }

  onStepperKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      this.previousStep();
      event.preventDefault();
    } else if (event.key === 'ArrowRight') {
      this.nextStep();
      event.preventDefault();
    }
  }

  nextStep() {
    const currentIndex = this.stepper.selectedIndex;
    if (currentIndex < this.stepper.steps.length - 1) {
      this.stepper.selectedIndex = currentIndex + 1;
    }
  }

  previousStep() {
    const currentIndex = this.stepper.selectedIndex;
    if (currentIndex > 0) {
      this.stepper.selectedIndex = currentIndex - 1;
    }
  }
}