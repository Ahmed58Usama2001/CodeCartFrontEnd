import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { DeliveryMethod } from '../../Shared/models/deliveryMethod';
import { map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  baseUrl = environment.apiUrl;

  private http = inject(HttpClient)

  deliveryMethods: DeliveryMethod[] = [];

  getDeliveryMethods() {
    if (this.deliveryMethods.length > 0) {
      return of(this.deliveryMethods);
    }
    return this.http.get<DeliveryMethod[]>(this.baseUrl + 'payments/delivery-methods').pipe(
      map(deliveryMethods => {
        this.deliveryMethods = deliveryMethods.sort((a, b) => a.price - b.price);
        return deliveryMethods;
      })
    );
  }
}
