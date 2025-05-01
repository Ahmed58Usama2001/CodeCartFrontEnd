import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Pagination } from '../../Shared/models/Pagination';
import { Product } from '../../Shared/models/Product';
import { ShopParams } from '../../Shared/models/ShopParams';

@Injectable({
  providedIn: 'root'
})
export class ShopService {


  baseUrl = 'https://localhost:7242/api/'
    
  private http = inject(HttpClient)

  brands:string[]=[]
  types:string[]=[]
   
getProducts(shopParams: ShopParams) {
  let params = new HttpParams();

  if (shopParams.brands.length) params = params.append('brands', shopParams.brands.join(','));
  if (shopParams.types.length) params = params.append('types', shopParams.types.join(','));
  if (shopParams.sort) params = params.append('sort', shopParams.sort);

  params = params.append('pageSize', shopParams.pageSize);
  params = params.append('pageIndex', shopParams.pageNumber);

  return this.http.get<Pagination<Product>>(this.baseUrl + 'products', { params });
}

    getBrands(){
    if(this.brands.length>0) return;

      return this.http.get<string[]>(this.baseUrl+'products/brands').subscribe({
    next:response=>this.brands=response,
    error:error=>console.log(error)
      })
  }

  getTypes(){
    if(this.types.length>0) return;
    
      return this.http.get<string[]>(this.baseUrl+'products/types').subscribe({
    next:response=>this.types=response,
    error:error=>console.log(error)
      })
  }
}
