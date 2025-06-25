import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { OrderToCreate } from '../../Shared/models/Order';
import { Order } from '@stripe/stripe-js';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  CreateOrder(orderToCreate:OrderToCreate){
    return this.http.post<Order>(this.baseUrl + 'orders', orderToCreate);
  }

  GetOrdersForUser(){
    return this.http.get<Order[]>(this.baseUrl + 'orders');
  }

  GetOrderDetailed(id: number){
    return this.http.get<Order>(this.baseUrl + 'orders/' + id);
  }
}
