import { inject, Injectable } from '@angular/core';
import { ConfirmationToken, loadStripe, Stripe, StripeAddressElement, StripeAddressElementOptions, StripeElements, StripePaymentElement, StripePaymentElementOptions } from '@stripe/stripe-js';
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
        // Only create initial payment intent if not already created
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

  async createAddressElement(): Promise<StripeAddressElement> {
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

      // Always create a new address element instance
      return elements.create('address', options);
    } else {
      throw new Error('Stripe elements not initialized');
    }
  }

  async createPaymentElement(): Promise<StripePaymentElement> {
    const elements = await this.initializeElements();
    if (elements) {
      const options: StripePaymentElementOptions = {
        layout: 'tabs',
        defaultValues: {
          billingDetails: {
            name: '',
            email: '',
          }
        }
      };

      // Always create a new payment element instance
      return elements.create('payment', options);
    } else {
      throw new Error('Stripe elements not initialized');
    }
  }

  async CreateConfirmationToken() {
    const stripe = await this.getStripeInstance();
    const elements = await this.initializeElements();
    const result = await elements?.submit();
    if (result?.error) throw result.error.message;
    if (stripe) { return await stripe.createConfirmationToken({ elements }) }
    else { throw new Error('Stripe not initialized'); }
  }

  async ConfirmPayment(confirmationToken: ConfirmationToken) {
    const stripe = await this.getStripeInstance();
    const elements = await this.initializeElements();
    const result = await elements?.submit();

    if (result?.error) throw result.error.message;

    const clientSecret = this.cartSerice.cart()?.clientSecret

    if (stripe && clientSecret) {
      return await stripe.confirmPayment({
        clientSecret: clientSecret,
        confirmParams: {
          confirmation_token: confirmationToken.id
        },
        redirect: 'if_required'
      });
    } else
      throw new Error('Stripe not initialized or client secret is missing');
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

  async confirmPayment(returnUrl: string) {
    const stripe = await this.getStripeInstance();
    if (!stripe || !this.elements) {
      throw new Error('Stripe not initialized');
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements: this.elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: returnUrl,
      }
    });

    if (error) {
      throw error;
    }

    return paymentIntent;
  }

  disposeElements() {
    this.elements = undefined;
    this.paymentIntentCreated = false;
  }
}