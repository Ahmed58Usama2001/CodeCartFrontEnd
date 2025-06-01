import { Component, inject, OnInit } from '@angular/core';
import { CheckoutService } from '../../../Core/services/checkout.service';

@Component({
  selector: 'app-checkout-delivery',
  imports: [],
  templateUrl: './checkout-delivery.component.html',
  styleUrl: './checkout-delivery.component.css'
})
export class CheckoutDeliveryComponent implements OnInit {
  ngOnInit(): void {
    this.checkoutService.getDeliveryMethods().subscribe()
  }
  checkoutService = inject(CheckoutService);
}
