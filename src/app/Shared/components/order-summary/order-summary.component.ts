// order-summary.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.css'
})
export class OrderSummaryComponent {
  @Input() subtotal: number = 0;
  @Input() shipping: number = 0;
  @Input() total: number = 0;
  @Input() hideCheckoutButton: boolean = false;

  @Output() promoCodeApplied = new EventEmitter<string>();
  @Output() checkoutClicked = new EventEmitter<void>();

  onApplyPromoCode(promoCode: string) {
    if (promoCode.trim()) {
      this.promoCodeApplied.emit(promoCode.trim());
    }
  }

  onCheckoutClick() {
    this.checkoutClicked.emit();
  }
}