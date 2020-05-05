import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisableControlDirective } from './disableControl.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [DisableControlDirective],

  exports: [DisableControlDirective]
})
export class DisableControlModule {}
