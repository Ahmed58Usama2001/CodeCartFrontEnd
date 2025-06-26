import { Component, inject, OnInit } from '@angular/core';
import { OrderService } from '../../../Core/services/order.service';
import { SnackbarService } from '../../../Core/services/snackbar.service';
import { Order } from '../../../Shared/models/Order';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-detailed',
  imports: [],
  templateUrl: './order-detailed.component.html',
  styleUrl: './order-detailed.component.css'
})
export class OrderDetailedComponent implements OnInit {
  private orderService = inject(OrderService);
  private snackBarService = inject(SnackbarService);
  private activatedRoute = inject(ActivatedRoute);

  order?: Order;


  ngOnInit(): void {
    this.loadOrder();
  }

  loadOrder() {
    const id = this.activatedRoute.snapshot.paramMap.get('id');
    if (!id) {
      this.snackBarService.error('Order ID is missing');
      return
    }

    this.orderService.GetOrderDetailed(+id).subscribe({
      next: (order) => {
        this.order = order;
      },
      error: (error) => {
        this.snackBarService.error(error);
      }
    })
  }

}
