import { DisableControlModule } from './../interfaces/disableControl/disableControl.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ButtonsModule, BsDropdownModule, CollapseModule } from 'ngx-bootstrap';

import { ProductGridComponent } from './product-grid/product-grid.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { FilterComponent } from './product-grid/components/filter/filter.component';
import { FilterDropdownComponent } from './product-grid/components/filterDropdown/filter-dropdown.component';
import { FilterModalComponent } from './product-grid/components/filterModal/filter-modal.component';
import { BannerComponent } from './product-detail/components/banner/banner.component';
import { BagComponent } from './product-detail/components/bag/bag.component';
import { GeneralComponent } from './product-detail/components/general/general.component';
import { SelectsComponent } from './product-detail/components/selects/selects.component';
import { PSectionComponent } from './product-detail/components/p-section/p-section.component';
import { DescriptionComponent } from './product-detail/components/description/description.component';
import { RatingComponent } from './product-detail/components/rating/rating.component';
import { ProductAddComponent } from './product-add/product-add.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProductEditComponent } from './product-edit/product-edit.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import {PaginatorModule} from 'primeng/paginator';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';


export const routes = [
  { path: '', redirectTo: 'product-grid', pathMatch: 'full' },
  { path: 'product-grid', component: ProductGridComponent, pathMatch: 'full' },
  {
    path: 'product-detail/:id',
    component: ProductDetailComponent,
    pathMatch: 'full'
  },
  { path: 'add', component: ProductAddComponent, pathMatch: 'full' },
  { path: 'edit/:id', component: ProductEditComponent, pathMatch: 'full' }
];

@NgModule({
  declarations: [
    ProductGridComponent,
    ProductDetailComponent,
    ProductAddComponent,
    ProductEditComponent,
    FilterComponent,
    FilterDropdownComponent,
    FilterModalComponent,
    BannerComponent,
    BagComponent,
    GeneralComponent,
    SelectsComponent,
    PSectionComponent,
    DescriptionComponent,
    RatingComponent
  ],
  imports: [
    ButtonsModule.forRoot(),
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    ProgressBarModule,
    ConfirmDialogModule,
    DisableControlModule,
    PaginatorModule,
    InfiniteScrollModule
  ],
  exports: [DescriptionComponent]
})
export class ProductModule {
  public static routes = routes;
}
