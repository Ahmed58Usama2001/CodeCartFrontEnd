import { Component, inject, OnInit } from '@angular/core';
import { HeaderComponent } from "./Layout/header/header.component";
import { HttpClient } from '@angular/common/http';
import { Product } from './Shared/models/Product';
import { Pagination } from './Shared/models/Pagination';
import { ShopService } from './Core/services/shop.service';
import { ShopComponent } from "./Features/shop/shop.component";

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, ShopComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{
 
}
