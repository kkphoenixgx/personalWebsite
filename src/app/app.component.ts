import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//import { HomeComponent } from './pages/home/home.component';
import { HeaderComponent } from './shared/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { FooterComponent } from './shared/footer/footer.component';

@Component({
    selector: 'app-root',
    standalone: true,
    template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
  `,
    imports: [RouterOutlet, HeaderComponent, MatIconModule, FooterComponent]
})
export class AppComponent{
  title = 'personal-website';
}
