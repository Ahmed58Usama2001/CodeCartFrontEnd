// checkout-delivery.component.ts
import { Component, inject, OnInit, Output, EventEmitter } from '@angular/core';
import { CheckoutService } from '../../../Core/services/checkout.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CartService } from '../../../Core/services/cart.service';

export interface DeliveryMethod {
  shortName: string;
  deliveryTime: string;
  description: string;
  price: number;
  id: number;
}

@Component({
  selector: 'app-checkout-delivery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatRadioModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './checkout-delivery.component.html',
  styleUrl: './checkout-delivery.component.css'
})
export class CheckoutDeliveryComponent implements OnInit {
  checkoutService = inject(CheckoutService);
  cartService = inject(CartService);
  
  deliveryMethods: DeliveryMethod[] = [];
  selectedDeliveryMethod: number | null = null;
  error: string | null = null;
  
  @Output() deliveryMethodSelected = new EventEmitter<DeliveryMethod>();

  ngOnInit(): void {
    this.loadDeliveryMethods();
  }

  loadDeliveryMethods(): void {
    this.checkoutService.getDeliveryMethods().subscribe({
      next: (methods: DeliveryMethod[]) => {
        this.deliveryMethods = methods;
        // Auto-select the first method if available
        if (methods.length > 0) {
          this.selectedDeliveryMethod = methods[0].id;
          // Emit the selected method immediately
          this.deliveryMethodSelected.emit(methods[0]);
        }
      },
      error: (err) => {
        this.error = 'Failed to load delivery methods. Please try again.';
        console.error('Error loading delivery methods:', err);
      }
    });
  }

  onDeliveryMethodChange(event: any): void {
    console.log('Delivery method changed:', event.value);
    const selectedMethod = this.deliveryMethods.find(method => method.id === event.value);
    if (selectedMethod) {
      // Emit the selected delivery method to parent component
      this.deliveryMethodSelected.emit(selectedMethod);
    }
  }

  getSelectedMethod(): DeliveryMethod | undefined {
    return this.deliveryMethods.find(method => method.id === this.selectedDeliveryMethod);
  }
}