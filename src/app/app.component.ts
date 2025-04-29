import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from "./Layout/header/header.component";
import { HttpClient } from '@angular/common/http';
import { Product } from './Shared/models/Product';
import { Pagination } from './Shared/models/PAgination';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
 
  title = 'CodeCart';
  baseUrl = 'https://localhost:7242/api/'

  private http = inject(HttpClient)

  products:Product[] =[] 

  ngOnInit(): void {
    this.http.get<Pagination<Product>>(this.baseUrl + 'products').subscribe({
      next:response=>this.products=response.data,
      error: error=>console.log(error),
      complete: ()=>console.log('completed')
    })
  }
}
