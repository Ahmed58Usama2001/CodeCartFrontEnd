import { inject, Injectable } from '@angular/core';
import { loadStripe, Stripe, StripeAddressElement, StripeAddressElementOptions, StripeElements } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { CartService } from './cart.service';
import { Cart } from '../../Shared/models/Cart';
import { first, firstValueFrom, map } from 'rxjs';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})
export class StripeService {

  private stripePromise?: Promise<Stripe | null>;
  private http = inject(HttpClient)
  private cartSerice = inject(CartService);
  private elements?: StripeElements;
  private addressElement?: StripeAddressElement;
  private accountService = inject(AccountService);
  private paymentIntentCreated = false;

  baseurl = environment.apiUrl;

  constructor() {
    this.stripePromise = loadStripe(environment.stripePublicKey);
  }

  getStripeInstance() {
    return this.stripePromise;
  }

  async initializeElements() {
    if (!this.elements) {
      const stripe = await this.getStripeInstance();
      if (stripe) {
        let cart: Cart;
        if (!this.paymentIntentCreated) {
          cart = await firstValueFrom(this.CreateOrUpdatePaymentIntent());
          this.paymentIntentCreated = true;
        } else {
          cart = this.cartSerice.cart()!;
        }
        
        this.elements = stripe.elements({
          clientSecret: cart.clientSecret,
          appearance: { labels: 'floating' }
        });
      }
      else {
        throw new Error('Stripe not loaded');
      }
    }

    return this.elements;
  }

  async createAddressElement() {
    if (!this.addressElement) {
      const elements = await this.initializeElements();
      if (elements) {
        const user = this.accountService.currentUser();
        let defaultValues: StripeAddressElementOptions['defaultValues'] = {};

        if (user) {
          defaultValues.name = user.firstName + ' ' + user.lastName;
        }

        if (user && user.address) {
          defaultValues = {
            ...defaultValues,
            address: {
              line1: user.address.line1,
              city: user.address.city,
              state: user.address.state,
              postal_code: user.address.postalCode,
              country: user.address.country
            }
          };
        }

        const options: StripeAddressElementOptions = {
          mode: 'shipping',
          defaultValues
        };
        this.addressElement = elements.create('address', options);
      } else {
        throw new Error('Stripe elements not initialized');
      }
    }

    return this.addressElement;
  }

  CreateOrUpdatePaymentIntent() {
    const cart = this.cartSerice.cart();

    if (!cart) throw new Error('Problem with cart');
    
    return this.http.post<Cart>(`${this.baseurl}payments/${cart.id}`, {}).pipe(
      map(cart => {
        this.cartSerice.cart.set(cart);
        return cart;
      })
    );
  }

  async updatePaymentIntentAmount() {
    if (this.elements && this.paymentIntentCreated) {
      return this.CreateOrUpdatePaymentIntent();
    }
    return null;
  }

  disposeElements() {
    this.elements = undefined;
    this.addressElement = undefined;
    this.paymentIntentCreated = false;
  }
}