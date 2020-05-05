import { ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CategoryRoutingModule } from './category-routing.module';
import { CategoryViewComponent } from './category-view/category-view.component';
import { CategoryAddComponent } from './category-add/category-add.component';
import { CategoryEditComponent } from './category-edit/category-edit.component';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
@NgModule({
  imports: [
    CommonModule,
    CategoryRoutingModule,
    ReactiveFormsModule,
    ConfirmDialogModule
  ],
  declarations: [CategoryViewComponent, CategoryAddComponent, CategoryEditComponent],
  exports: [CategoryViewComponent, CategoryAddComponent, CategoryEditComponent]
})
export class CategoryModule { }
