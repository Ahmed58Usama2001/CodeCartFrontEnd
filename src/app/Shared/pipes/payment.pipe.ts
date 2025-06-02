import { Pipe, PipeTransform } from '@angular/core';
import { ConfirmationToken } from '@stripe/stripe-js';

@Pipe({
  name: 'payment',
  standalone: true
})
export class PaymentPipe implements PipeTransform {

  transform(value?: ConfirmationToken['payment_method_preview'], ...args: unknown[]): string {
    if (value?.card) {
      const card = value.card;
      const brand = card.brand ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1) : 'Card';
      const last4 = card.last4 ? `****${card.last4}` : '';
      const expiry = card.exp_month && card.exp_year ? `${card.exp_month.toString().padStart(2, '0')}/${card.exp_year.toString().slice(-2)}` : '';
      
      if (last4 && expiry) {
        return `${brand} ending in ${last4} (${expiry})`;
      } else if (last4) {
        return `${brand} ending in ${last4}`;
      } else {
        return `${brand} payment method`;
      }
    } else if (value?.type) {
      // Handle other payment types
      const type = value.type.charAt(0).toUpperCase() + value.type.slice(1);
      return `${type} payment method`;
    }
    
    return 'No payment method provided';
  }
}