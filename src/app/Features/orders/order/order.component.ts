import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../Core/services/order.service';
import { Order } from '../../../Shared/models/Order';
import { SnackbarService } from '../../../Core/services/snackbar.service';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CurrencyPipe, 
    DatePipe, 
    RouterLink,
    MatTableModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent implements OnInit {
  private orderService = inject(OrderService);
  private snackBarService = inject(SnackbarService);
  
  orders: Order[] = [];
  loading = true;
  displayedColumns: string[] = ['id', 'orderDate', 'total', 'orderStatus', 'deliveryMethod'];

  ngOnInit(): void {
    this.orderService.GetOrdersForUser().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (error) => {
        this.snackBarService.error(error);
        this.loading = false;
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warn';
      case 'PaymentReceived':
        return 'primary';
      case 'PaymentFailed':
        return 'accent';
      default:
        return 'primary';
    }
  }
}