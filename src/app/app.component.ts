import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
//import { HomeComponent } from './pages/home/home.component';
import { HeaderComponent } from './shared/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { FooterComponent } from './shared/footer/footer.component';
import { Title, Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

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

  private titleService = inject(Title);
  private metaService = inject(Meta);
  private translate = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.translate.setDefaultLang('en');

    if (isPlatformBrowser(this.platformId)) {
      const savedLang = localStorage.getItem('lang') || 'en';
      this.translate.use(savedLang);
    } else {
      this.translate.use('en');
    }

    this.translate.get('META.TITLE').subscribe(title => {
      this.titleService.setTitle(title);
    });

    this.translate.get('META.DESCRIPTION').subscribe(desc => {
      this.metaService.addTags([
        { name: 'description', content: desc },
        { property: 'og:title', content: 'Kkphoenix - Fullstack Developer' }, // Or use title
        { property: 'og:description', content: desc },
        { property: 'og:image', content: 'https://kkphoenix.com.br/assets/logoCompleta.webp' },
        { property: 'og:url', content: 'https://kkphoenix.com.br' },
        { name: 'author', content: 'Kauã Alves Santos' }
      ]);
    });
  }
}
