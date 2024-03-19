import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { HeaderComponent } from './shared/header/header.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-root',
    standalone: true,
    template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
  `,
    imports: [RouterOutlet, HomeComponent, HeaderComponent, MatIconModule]
})
export class AppComponent {
  title = 'personal-website';
}
