import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { OrderParams } from '../../Shared/models/OrderParams';
import { Pagination } from '../../Shared/models/Pagination';
import { Order } from '../../Shared/models/Order';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getOrders(orderParams:OrderParams){
    let params = new HttpParams();
    if(orderParams.filter && orderParams.filter !== 'All') {
      params = params.append('filter', orderParams.filter);
    }
    params = params.append('pageIndex', orderParams.pageIndex);
    params = params.append('pageSize', orderParams.pageSize);

    return this.http.get<Pagination<Order>>(this.baseUrl + 'admin/orders', { params });
  }

  getOrder(id: number) {
    return this.http.get<Order>(this.baseUrl + 'admin/orders/' + id);
  }

  refundOrder(id: number) {
    return this.http.post<Order>(this.baseUrl + 'admin/orders/refund/' + id , {});
  }
}
