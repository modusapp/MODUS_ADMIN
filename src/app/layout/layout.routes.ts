import { RoleguardService } from './../services/roleguard.service';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';
const routes: Routes = [
  { path: '', component: LayoutComponent, children: [
    { path: '', redirectTo: 'orders', pathMatch: 'full' },
    { path: 'dashboard', redirectTo: 'orders' },
    { path: 'orders', loadChildren: '../orders/orders.module#OrdersModule' },
    {path: 'product', loadChildren: '../product/product.module#ProductModule', canActivate: [RoleguardService]},
    {path: 'category', loadChildren: '../category/category.module#CategoryModule', canActivate: [RoleguardService]},
    {path: 'users', loadChildren: '../users/users.module#UsersModule', canActivate: [RoleguardService]}
  ]}
];

export const ROUTES = RouterModule.forChild(routes);
