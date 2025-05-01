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

@Component({
  selector: 'app-shop',
  imports: [ProductItemComponent,
     MatButton,
     MatIcon,
    MatMenuModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {
  private shopService = inject(ShopService)
  private dialogService = inject(MatDialog)

  selectedBrands:string[]=[]
  selectedTypes:string[]=[]

  sortOptions = [
    { value: 'name', display: 'Alphabetical', icon: 'sort_by_alpha' },
    { value: 'priceAsc', display: 'Price: Low to High', icon: 'arrow_upward' },
    { value: 'priceDesc', display: 'Price: High to Low', icon: 'arrow_downward' }
  ];
  selectedSort = '';

  products:Product[] =[] 

  ngOnInit(): void {
    this.initializeShop();
  }

  private getProducts() {
    this.shopService.getProducts(this.selectedBrands, this.selectedTypes, this.selectedSort)
      .subscribe({
        next: response => this.products = response.data,
        error: error => console.log(error)
      });
  }

  initializeShop(){
    this.getProducts();

    this.shopService.getBrands();

    this.shopService.getTypes();
  }

  onSortSelected(sortOption: string) {
    this.selectedSort = sortOption;
    this.getProducts();
  }

  openFiltersDialog(){
    const dialogRef= this.dialogService.open(FiltersDialogeComponent,{
      minWidth:'500px',
      data:{
        selectedBrands: this.selectedBrands,
        selectedTypes: this.selectedTypes
      }
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.selectedBrands = result.selectedBrands;
        this.selectedTypes = result.selectedTypes;
        this.getProducts()
      }
    });
  }
}
