import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { LampComponent } from './lamp/lamp.component';
import { FooterComponent } from './footer/footer.component';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    HeaderComponent,
    LampComponent,
    FooterComponent
  ],
  exports: [
    HeaderComponent,
    LampComponent,
    FooterComponent
  ]
})
export class SharedModule { }
