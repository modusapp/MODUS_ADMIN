import { UserEditComponent } from './user-edit/user-edit.component';
import { UserAddComponent } from './user-add/user-add.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserViewComponent } from './user-view/user-view.component';
import { ButtonsModule, BsDropdownModule, CollapseModule } from 'ngx-bootstrap';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ProgressBarModule } from 'primeng/progressbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { NgxMaskModule } from 'ngx-mask';
import {TableModule} from 'primeng/table';

export const routes = [
  { path: '', redirectTo: 'view', pathMatch: 'full' },
  {path: 'view', component: UserViewComponent, pathMatch: 'full'},
  {path: 'add', component: UserAddComponent, pathMatch: 'full'},
  {path: 'edit/:id', component: UserEditComponent, pathMatch: 'full'}
];
@NgModule({
  declarations: [UserViewComponent, UserAddComponent, UserEditComponent],
  imports: [
    CommonModule,
    ButtonsModule.forRoot(),
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    ProgressBarModule,
    ConfirmDialogModule,
    NgxMaskModule.forRoot(),
    TableModule,
    ConfirmDialogModule
  ],
  exports: [UserViewComponent, UserAddComponent, UserEditComponent]
})
export class UsersModule {
  public static routes = routes;

}
