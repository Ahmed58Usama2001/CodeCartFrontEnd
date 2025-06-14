// product-details.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { ShopService } from '../../../Core/services/shop.service';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../../Shared/models/Product';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { SnackbarService } from '../../../Core/services/snackbar.service';
import { CartService } from '../../../Core/services/cart.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    FormsModule,
    MatSnackBarModule,
    MatDividerModule,
    MatCardModule
  ],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  private shopService = inject(ShopService);
  private cartService = inject(CartService);
  private activatedRoute = inject(ActivatedRoute);
  private snackBar = inject(SnackbarService);
  
  product?: Product;
  quantityInCart: number = 0;
  quantity: number = 1;
  loading: boolean = true;

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (id) {
      this.shopService.getProduct(+id).subscribe({
        next: (response) => {
          {this.product = response;
          this.loading = false;
            this.updateQuantityInCart();
          }
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.loading = false;
        }
      });
    }
  }

  updateQuantityInCart(){
    this.quantityInCart = this.cartService.cart()?.items.find(item => item.productId === this.product?.id)?.quantity || 0;
    this.quantity = this.quantityInCart > 0 ? this.quantityInCart : 1;
  }

  getButtonText(): string {
    return this.quantityInCart > 0 ? 'Update Cart' : 'Add to Cart';
  }

  UpdateCart() {
    if (!this.product) return

    if(this.quantity>this.quantityInCart)
    {
      const itemsToAdd = this.quantity-this.quantityInCart;
      this.quantityInCart +=itemsToAdd
      this.cartService.addItemToCart(this.product,itemsToAdd)
    }
    else{
      const itemsToRemove = this.quantityInCart-this.quantity;
      this.quantityInCart -=itemsToRemove
      this.cartService.removeItemFromCart(this.product.id,itemsToRemove)
    }
      this.snackBar.success(`Updated ${this.quantity} of ${this.product.name} to cart`);
  }

  incrementQuantity() {
    if (this.product && this.quantity < this.product.quantityInStock) {
      this.quantity++;
    }
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
}