import { Routes } from '@angular/router';
import { HomeComponent } from './Features/home/home.component';
import { ShopComponent } from './Features/shop/shop.component';
import { ProductDetailsComponent } from './Features/shop/product-details/product-details.component';
import { TestErrorComponent } from './Features/test-error/test-error.component';
import { NotFoundComponent } from './Shared/components/not-found/not-found.component';
import { ServerErrorComponent } from './Shared/components/server-error/server-error.component';
import { CartComponent } from './Features/cart/cart.component';
import { CheckoutComponent } from './Features/checkout/checkout.component';
import { LoginComponent } from './Features/account/login/login.component';
import { RegisterComponent } from './Features/account/register/register.component';
import { authGuard } from './Core/guards/auth.guard';
import { CheckoutSuccessComponent } from './Features/checkout/checkout-success/checkout-success.component';
import { OrderComponent } from './Features/orders/order/order.component';
import { OrderDetailedComponent } from './Features/orders/order-detailed/order-detailed.component';
import { orderCompleteGuard } from './Core/guards/order-complete.guard';

export const routes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'shop', component: ShopComponent},
    {path: 'shop/:id', component: ProductDetailsComponent},
    {path: 'test-error', component: TestErrorComponent},
    {path: 'not-found', component: NotFoundComponent},
    {path: 'server-error', component: ServerErrorComponent},
    {path: 'cart', component: CartComponent},
    {path: 'orders', component: OrderComponent,canActivate: [authGuard]},
    {path: 'orders/:id', component: OrderDetailedComponent,canActivate: [authGuard]},
    {path: 'checkout', component: CheckoutComponent,canActivate: [authGuard]},
    {path: 'checkout/success', component: CheckoutSuccessComponent,canActivate: [authGuard,orderCompleteGuard]},
    {path: 'account/login', component: LoginComponent},
    {path: 'account/register', component: RegisterComponent},
    {path: '**',redirectTo:'not-found' ,pathMatch:'full'}
];
