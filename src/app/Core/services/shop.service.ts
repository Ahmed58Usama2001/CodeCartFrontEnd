import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Pagination } from '../../Shared/models/Pagination';
import { Product } from '../../Shared/models/Product';

@Injectable({
  providedIn: 'root'
})
export class ShopService {


  baseUrl = 'https://localhost:7242/api/'
    
  private http = inject(HttpClient)

  brands:string[]=[]
  types:string[]=[]
   
  getProducts(){
    return this.http.get<Pagination<Product>>(this.baseUrl + 'products?pageSize=20')
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
