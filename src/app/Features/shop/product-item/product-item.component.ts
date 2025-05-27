import { Component, inject, Input } from '@angular/core';
import { Product } from '../../../Shared/models/Product';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Cart } from '../../../Shared/models/Cart';
import { CartService } from '../../../Core/services/cart.service';
import { SnackbarService } from '../../../Core/services/snackbar.service';

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

  cartService = inject(CartService);
  snackbarService = inject(SnackbarService)

  addItemToCart(product:Product){
    this.cartService.addItemToCart(product);
    this.snackbarService.success(`Product ${product.name} added to cart successfully!`);
  }
}
