import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DatesPageModule } from './dates.module';


const routes: Routes = [
  {
    path: '',
    component: DatesPageModule
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchedulePageRoutingModule { }
