import { OrderHistoryComponent } from './order-history/order-history.component';
import { OrderViewComponent } from './order-view/order-view.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OrderDetailPageComponent } from './order-detail-page/order-detail-page.component';
import { CustomerMapComponent } from './customer-map/customer-map.component';

const routes: Routes = [
  { path: '', redirectTo: 'view', pathMatch: 'full' },
  { path: 'view', component: OrderViewComponent, pathMatch: 'full' },
  { path: 'history', component: OrderHistoryComponent, pathMatch: 'full' },
  {
    path: 'details/:id',
    component: OrderDetailPageComponent,
    pathMatch: 'full'
  },
  { path: 'map', component: CustomerMapComponent, pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdersRoutingModule {}
