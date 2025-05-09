import { Component, Input } from '@angular/core';
import { Product } from '../../../Shared/models/Product';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-item',
  imports: [MatCardModule,
     MatButtonModule,
     MatIconModule,
     CurrencyPipe,
     RouterLink
    ],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.css'
})
export class ProductItemComponent {
  @Input() product?:Product;
}
