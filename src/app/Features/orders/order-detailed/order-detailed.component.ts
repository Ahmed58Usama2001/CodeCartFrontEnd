import { Component, inject, OnInit } from '@angular/core';
import { OrderService } from '../../../Core/services/order.service';
import { SnackbarService } from '../../../Core/services/snackbar.service';
import { Order } from '../../../Shared/models/Order';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-order-detailed',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatCardModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './order-detailed.component.html',
  styleUrl: './order-detailed.component.css'
})
export class OrderDetailedComponent implements OnInit {
  private orderService = inject(OrderService);
  private snackBarService = inject(SnackbarService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  order?: Order;
  loading = true;

  ngOnInit(): void {
    this.loadOrder();
  }

  loadOrder() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) {
      this.snackBarService.error('Order ID is missing');
      this.router.navigate(['/orders']);
      return;
    }

    this.orderService.GetOrderDetailed(+id).subscribe({
      next: (order) => {
        this.order = order;
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

  goBack() {
    this.router.navigate(['/orders']);
  }
}