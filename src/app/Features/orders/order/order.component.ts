import { Component, inject, OnInit } from '@angular/core';
import { OrderService } from '../../../Core/services/order.service';
import { Order } from '../../../Shared/models/Order';
import { SnackbarService } from '../../../Core/services/snackbar.service';

@Component({
  selector: 'app-order',
  imports: [],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css'
})
export class OrderComponent implements OnInit {
  private orderService = inject(OrderService);
  private snackBarService = inject(SnackbarService);
  orders:Order[] = [];

  ngOnInit(): void {
    this.orderService.GetOrdersForUser().subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: (error) => {
        this.snackBarService.error(error);
      }
    });
  }


}
