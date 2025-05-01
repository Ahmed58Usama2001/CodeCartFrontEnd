import { Component, inject, OnInit } from '@angular/core';
import { ShopService } from '../../Core/services/shop.service';
import { Product } from '../../Shared/models/Product';
import { ProductItemComponent } from "./product-item/product-item.component";
import { MatDialog } from '@angular/material/dialog';import { FiltersDialogeComponent } from './filters-dialoge/filters-dialoge.component';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-shop',
  imports: [ProductItemComponent, MatButton, MatIcon],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {
  private shopService = inject(ShopService)
  private dialogService = inject(MatDialog)

  selectedBrands:string[]=[]
  selectedTypes:string[]=[]


  products:Product[] =[] 

  ngOnInit(): void {
    this.initializeShop();
  }

  initializeShop(){
    this.shopService.getProducts().subscribe({
      next:response=>this.products=response.data,
      error: error=>console.log(error)
    })

    this.shopService.getBrands();

    this.shopService.getTypes();
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
        this.shopService.getProducts(this.selectedBrands, this.selectedTypes).subscribe({
          next:response=>this.products=response.data,
          error:error=>console.log(error)          
        })
      }
    });
  }
}
