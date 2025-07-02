import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Order, OrderToCreate } from '../../Shared/models/Order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  orderComplete:boolean = false;

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
