import { Component, inject } from '@angular/core';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BusyService } from '../../Core/services/busy.service';
import { MatProgressBarModule } from '@angular/material/progress-bar'; // Import the module
import { CartService } from '../../Core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    NgbCollapseModule,
    MatProgressBarModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isMenuCollapsed = true; 

   busyService = inject(BusyService);
   cartService = inject(CartService);

}