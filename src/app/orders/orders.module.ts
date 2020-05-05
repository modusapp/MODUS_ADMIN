import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ItemDescriptionComponent } from './components/item-description/item-description.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrdersRoutingModule } from './orders-routing.module';
import { OrderViewComponent } from './order-view/order-view.component';
import { MomentModule } from 'ngx-moment';
import { OrderHistoryComponent } from './order-history/order-history.component';
import {TableModule} from 'primeng/table';
import { OrderDetailComponent } from './components/order-detail/order-detail.component';
import { OrderDetailPageComponent } from './order-detail-page/order-detail-page.component';
import { OrderOptionsComponent } from './components/order-options/order-options.component';
import { ProductModule } from '../product/product.module';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import {SidebarModule} from 'primeng/sidebar';
import { CustomerMapComponent } from './customer-map/customer-map.component';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import {MultiSelectModule} from 'primeng/multiselect';

@NgModule({
  imports: [
    CommonModule, SidebarModule,
    OrdersRoutingModule, MomentModule, TableModule,  CollapseModule.forRoot(), ButtonsModule, ReactiveFormsModule, FormsModule, NgxMapboxGLModule.withConfig({
      accessToken: 'pk.eyJ1IjoibW9kdXMtd2hlZWxpbmciLCJhIjoiY2sydGVrZzB4MWFqejNjdG9kNmVtdnEwdiJ9.709LdyTpCeO02EkGAbGnRQ', // Optionnal, can also be set per map (accessToken input of mgl-map)
      geocoderAccessToken: 'TOKEN' // Optionnal, specify if different from the map access token, can also be set per mgl-geocoder (accessToken input of mgl-geocoder)
    }), MultiSelectModule
  ],
  declarations: [OrderViewComponent, OrderHistoryComponent, OrderDetailComponent, OrderDetailPageComponent, OrderOptionsComponent, ItemDescriptionComponent, CustomerMapComponent],
  exports: [OrderViewComponent, OrderHistoryComponent, OrderDetailComponent, OrderDetailPageComponent, OrderOptionsComponent, ItemDescriptionComponent]
})
export class OrdersModule { }
