import { Component, AfterViewInit, OnDestroy, ElementRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-personal-website',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './personal-website.component.html',
  styleUrl: './personal-website.component.scss'
})
export class PersonalWebsiteComponent implements OnInit, AfterViewInit, OnDestroy {

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

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    this.translate.get('PROJECT_PERSONAL.HERO_TITLE').subscribe(title => {
       const plainTitle = title.replace(/<[^>]*>/g, '');
       this.titleService.setTitle(`${plainTitle} | Engineering Showcase`);
    });
    
    this.translate.get('PROJECT_PERSONAL.HERO_DESC').subscribe(desc => {
       const plainDesc = desc.replace(/<[^>]*>/g, '');
       this.metaService.updateTag({ name: 'description', content: plainDesc });
    });
  }

  ngAfterViewInit(): void {
    this.setupScrollAnimations();
  }

  private setupScrollAnimations(): void {
    const options = { root: null, rootMargin: '0px', threshold: 0.15 };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
        else entry.target.classList.remove('visible');
      });
    }, options);

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
