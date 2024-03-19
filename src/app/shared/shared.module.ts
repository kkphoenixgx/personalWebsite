import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { LampComponent } from './lamp/lamp.component';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    HeaderComponent,
    LampComponent
  ],
  exports: [
    HeaderComponent,
    LampComponent
  ]
})
export class SharedModule { }
