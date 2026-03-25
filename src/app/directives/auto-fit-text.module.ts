import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AutofitTextDirective } from './auto-fit-text.directive';

@NgModule({
  declarations: [
    AutofitTextDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AutofitTextDirective 
  ]
})
export class AutoFitTextModule { }