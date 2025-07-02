import { Component, inject, OnDestroy } from '@angular/core';
import { SignalrService } from '../../../Core/services/signalr.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { AddressPipe } from '../../../Shared/pipes/address.pipe';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../Core/services/order.service';

@Component({
  selector: 'app-checkout-success',
   imports: [CommonModule,
    MatProgressSpinnerModule,  
    MatIconModule,             
    MatButtonModule, 
    CurrencyPipe,
    DatePipe        ,
    AddressPipe  ,
    RouterLink
  ],
  standalone: true,
  templateUrl: './checkout-success.component.html',
  styleUrls: ['./checkout-success.component.css']
})
export class CheckoutSuccessComponent implements OnDestroy{
  
  public signalrService = inject(SignalrService);
  private orderService = inject(OrderService);
  
  ngOnDestroy(): void {
    this.orderService.orderComplete = false; 
    this.signalrService.orderSignal.set(null);
  }
}