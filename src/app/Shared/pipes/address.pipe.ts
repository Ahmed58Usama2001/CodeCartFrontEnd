import { Pipe, PipeTransform } from '@angular/core';
import { ConfirmationToken } from '@stripe/stripe-js';

@Pipe({
  name: 'address',
  standalone: true
})
export class AddressPipe implements PipeTransform {

  transform(value?: ConfirmationToken['shipping'], ...args: unknown[]): string {
    if (value?.address && value.name) {
      const address = value.address;
      const parts = [
        value.name,
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.postal_code,
        address.country
      ].filter(part => part && part.trim()); 
      
      return parts.join(', ');
    }
    return 'No address provided';
  }
}