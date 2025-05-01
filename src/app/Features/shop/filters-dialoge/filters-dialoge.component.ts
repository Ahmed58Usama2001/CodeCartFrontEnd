import { Component, inject, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShopService } from '../../../Core/services/shop.service';

@Component({
  selector: 'app-filters-dialoge',
  imports: [
    CommonModule,
    FormsModule,
    MatListModule,
    MatDividerModule,
    MatButtonModule
  ],
  templateUrl: './filters-dialoge.component.html',
  styleUrl: './filters-dialoge.component.css'
})

export class FiltersDialogeComponent {
  shopService = inject(ShopService);
  private dialogRef = inject(MatDialogRef<FiltersDialogeComponent>);
  data = inject(MAT_DIALOG_DATA);

  selectedBrands: string[] = [...this.data.selectedBrands];
  selectedTypes: string[] = [...this.data.selectedTypes];

  applyFilters() {
    this.dialogRef.close({
      selectedBrands: this.selectedBrands,
      selectedTypes: this.selectedTypes
    });
  }

  onCancel() {
    this.dialogRef.close();
  }

  clearFilters() {
    this.selectedBrands = [];
    this.selectedTypes = [];
  }
}
