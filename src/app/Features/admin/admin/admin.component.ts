import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../Core/services/admin.service';
import { OrderParams } from '../../../Shared/models/OrderParams';
import { Pagination } from '../../../Shared/models/Pagination';
import { Order } from '../../../Shared/models/Order';
import { Router } from '@angular/router';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatCardModule,
    FormsModule,
    DatePipe,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
@ViewChild(MatPaginator) paginator!: MatPaginator;
  
  private adminService = inject(AdminService);
  private router = inject(Router);
  
  displayedColumns: string[] = ['id', 'buyerEmail', 'orderDate', 'status','total', 'actions'];
  dataSource = new MatTableDataSource<Order>();
  
  orderParams = new OrderParams();
  loading = false;
  
  statusOptions = [
    { value: '', label: 'All' },
    { value: 'PaymentReceived', label: 'Payment Received' },
    { value: 'PaymentMismatch', label: 'Payment Mismatch' },
    { value: 'Refunded', label: 'Refunded' },
    { value: 'Pending', label: 'Pending' }
  ];

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.adminService.getOrders(this.orderParams).subscribe({
      next: (response) => {
        this.dataSource.data = response.data;        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(event: any) {
    this.orderParams.pageIndex = event.pageIndex + 1;
    this.orderParams.pageSize = event.pageSize;
    this.loadOrders();
  }


  onStatusChange(event: any) {
    this.orderParams.filter = event.value;
    this.orderParams.pageIndex = 1;
        console.log(this.orderParams.filter);

    this.loadOrders();
  }

  viewOrder(orderId: number) {
    this.router.navigate(['/orders', orderId]);
  }

  refundOrder(orderId: number) {
    if (confirm('Are you sure you want to refund this order?')) {
      this.adminService.refundOrder(orderId).subscribe({
        next: (response) => {
          this.dataSource.data = this.dataSource.data.map(order => 
            order.id === orderId ? { ...order, orderStatus: 'Refunded' } : order
          );
        },
        error: (error) => {
          console.error('Error refunding order:', error);
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'paymentreceived':
        return 'status-success';
      case 'paymentmismatch':
        return 'status-warning';
      case 'refunded':
        return 'status-info';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-default';
    }
  }
}