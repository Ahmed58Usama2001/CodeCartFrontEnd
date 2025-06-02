// checkout-review.component.ts
import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { CartService } from '../../../Core/services/cart.service';
import { ConfirmationToken } from '@stripe/stripe-js';
import { PaymentPipe } from '../../../Shared/pipes/payment.pipe';
import { AddressPipe } from '../../../Shared/pipes/address.pipe';


export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  pictureUrl: string;
  brand: string;
  type: string;
  quantity: number;
}

@Component({
  selector: 'app-checkout-review',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    AddressPipe,
    PaymentPipe
  ],
  templateUrl: './checkout-review.component.html',
  styleUrl: './checkout-review.component.css'
})
export class CheckoutReviewComponent {
  private cartService = inject(CartService);
  @Input() confirmationToken?: ConfirmationToken;
  
  cartItems = this.cartService.cart()?.items || [];
  subtotal = this.cartService.subtotal;
  shipping = this.cartService.shipping;
  total = this.cartService.total;

  displayedColumns: string[] = ['product', 'price', 'quantity', 'total'];
}