import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
//import { HomeComponent } from './pages/home/home.component';
import { HeaderComponent } from './shared/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { FooterComponent } from './shared/footer/footer.component';
import { Title, Meta } from '@angular/platform-browser';

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
export class AppComponent implements OnInit {
  title = 'personal-website';

  constructor(private titleService: Title, private metaService: Meta) {}

  ngOnInit(): void {
    this.titleService.setTitle('Kkphoenix - Fullstack Developer');
    this.metaService.addTags([
      { name: 'description', content: 'Portfolio of Kauã Alves Santos, a fullstack web developer specializing in Angular, Node.js, and 3D web experiences.' },
      { property: 'og:title', content: 'Kkphoenix - Fullstack Developer' },
      { property: 'og:description', content: 'Portfolio of Kauã Alves Santos, a fullstack web developer specializing in Angular, Node.js, and 3D web experiences.' },
      { property: 'og:image', content: 'https://kkphoenix.com.br/assets/logoCompleta.png' },
      { property: 'og:url', content: 'https://kkphoenix.com.br' },
      { name: 'author', content: 'Kauã Alves Santos' }
    ]);
  }
}
