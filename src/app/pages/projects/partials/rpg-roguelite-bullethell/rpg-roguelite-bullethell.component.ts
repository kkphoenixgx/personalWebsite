import { Component, AfterViewInit, OnDestroy, ElementRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-rpg-roguelite-bullethell',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './rpg-roguelite-bullethell.component.html',
  styleUrl: './rpg-roguelite-bullethell.component.scss'
})
export class RpgRogueliteBullethellComponent implements OnInit, AfterViewInit, OnDestroy {

  private observer: IntersectionObserver | null = null;
  private el = inject(ElementRef);

  public darkModeService = inject(DarkModeControllerService);
  public animationService = inject(AnimationControllerService);
  public isDarkMode$ = this.darkModeService.getDarkModeObserbable();
  public isAnimated$ = this.animationService.getAnimationObserbable();

  private translate = inject(TranslateService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  constructor() {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    this.translate.get('RPG.HERO.TITLE').subscribe(title => {
      this.titleService.setTitle(`${title} | Indie Showcase`);
    });
    this.translate.get('RPG.HERO.TAGLINE').subscribe(desc => {
      this.metaService.updateTag({ name: 'description', content: desc });
    });
  }

  ngAfterViewInit(): void {
    this.setupScrollAnimations();
  }

  private setupScrollAnimations(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15 // Dispara quando 15% do elemento entra na tela
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Descomente a linha abaixo se quiser que a animação rode APENAS UMA VEZ
          // this.observer?.unobserve(entry.target); 
        } else {
          // Remove a classe para a animação repetir quando o usuário subir e descer a página
          entry.target.classList.remove('visible');
        }
      });
    }, options);

    // Busca todos os elementos que possuem as classes de reveal
    const hiddenElements = this.el.nativeElement.querySelectorAll('.reveal-up, .observe-me');
    hiddenElements.forEach((el: Element) => this.observer!.observe(el));
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

}
