import { Component, inject, OnInit } from '@angular/core';
import { ShopService } from '../../Core/services/shop.service';
import { Product } from '../../Shared/models/Product';
import { ProductItemComponent } from "./product-item/product-item.component";
import { MatDialog } from '@angular/material/dialog';import { FiltersDialogeComponent } from './filters-dialoge/filters-dialoge.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ShopParams } from '../../Shared/models/ShopParams';
import {MatPaginator} from '@angular/material/paginator';
import { Pagination } from '../../Shared/models/Pagination';
import { PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop',
  imports: [ProductItemComponent,
     MatButton,
     MatIcon,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatPaginator,
    FormsModule,
    CommonModule
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {
  private shopService = inject(ShopService)
  private dialogService = inject(MatDialog)

  shopParams = new ShopParams()

  sortOptions = [
    { value: 'name', display: 'Alphabetical', icon: 'sort_by_alpha' },
    { value: 'priceAsc', display: 'Price: Low to High', icon: 'arrow_upward' },
    { value: 'priceDesc', display: 'Price: High to Low', icon: 'arrow_downward' }
  ];

  products?:Pagination<Product>;

  ngOnInit(): void {
    this.initializeShop();
  }

  private getProducts() {
    this.shopService.getProducts(this.shopParams)
      .subscribe({
        next: response => {
          this.products= response;
        },
        error: error => console.log(error)
      });
  }

  pageSizeOptions = [5, 10, 15, 20];

  initializeShop(){
    this.getProducts();

    this.shopService.getBrands();

    this.shopService.getTypes();
  }

  onSortSelected(sortOption: string) {
    this.shopParams.sort = sortOption;
    this.shopParams.pageNumber = 1;
    this.getProducts();
  }

  onSearch() {
    this.shopParams.pageNumber = 1; 
    this.getProducts();
  }

  openFiltersDialog(){
    const dialogRef= this.dialogService.open(FiltersDialogeComponent,{
      minWidth:'500px',
      data:{
        selectedBrands: this.shopParams.brands,
        selectedTypes: this.shopParams.types
      }
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.shopParams.brands = result.selectedBrands;
        this.shopParams.types = result.selectedTypes;
        this.shopParams.pageNumber = 1;
        this.getProducts()
      }
    });
  }

  
  onPageChanged(event: PageEvent) {
    if (this.shopParams.pageSize !== event.pageSize) {
      this.shopParams.pageNumber = 1; 
    } else {
      this.shopParams.pageNumber = event.pageIndex + 1; 
    }
    this.shopParams.pageSize = event.pageSize;
    this.getProducts();
  }

}
