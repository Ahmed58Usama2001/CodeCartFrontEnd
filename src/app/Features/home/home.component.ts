import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { Product } from '../../Shared/models/Product';
import { ShopParams } from '../../Shared/models/ShopParams';
import { ShopService } from '../../Core/services/shop.service';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatGridListModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private shopService = inject(ShopService);
  
  featuredProducts: Product[] = [];
  loading = false;
  
  features = [
    {
      icon: 'code',
      title: 'Premium Code',
      description: 'High-quality, well-documented code solutions for developers'
    },
    {
      icon: 'shopping_cart',
      title: 'Easy Shopping',
      description: 'Simple and secure checkout process with instant downloads'
    },
    {
      icon: 'support',
      title: '24/7 Support',
      description: 'Professional support team ready to help you succeed'
    },
    {
      icon: 'verified',
      title: 'Quality Assured',
      description: 'All products are tested and verified by our expert team'
    }
  ];

  ngOnInit() {
    this.loadFeaturedProducts();
  }

  loadFeaturedProducts() {
    this.loading = true;
    const shopParams = new ShopParams();
    shopParams.pageSize = 8;
    shopParams.pageNumber = 1;
    
    this.shopService.getProducts(shopParams).subscribe({
      next: (response) => {
        this.featuredProducts = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
        this.loading = false;
      }
    });
  }
}