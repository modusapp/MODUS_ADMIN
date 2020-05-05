import { CategoryEditComponent } from './category-edit/category-edit.component';
import { CategoryViewComponent } from './category-view/category-view.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategoryAddComponent } from './category-add/category-add.component';

const routes: Routes = [
  { path: '', redirectTo: 'view', pathMatch: 'full' },
  {path: 'view', component: CategoryViewComponent, pathMatch: 'full'},
  {path: 'add', component: CategoryAddComponent, pathMatch: 'full'},
  {path: 'edit/:id', component: CategoryEditComponent, pathMatch: 'full'},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategoryRoutingModule {
  public static routes = routes;

 }
