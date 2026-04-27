import { Component, inject, OnInit, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { TheEyeComponent } from './partials/the-eye/the-eye.component';
import { gsap } from 'gsap';
import { Title, Meta } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-the-big-agent',
  standalone: true,
  imports: [CommonModule, RouterModule, TheEyeComponent, TranslateModule],
  templateUrl: './the-big-agent.component.html',
  styleUrls: ['./the-big-agent.component.scss']
})
export class TheBigAgentComponent implements OnInit, AfterViewInit, OnDestroy {
  private darkModeService = inject(DarkModeControllerService);
  private el = inject(ElementRef);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private translate = inject(TranslateService);
  public isDarkMode$ = this.darkModeService.getDarkModeObserbable();

  private observer: IntersectionObserver | null = null;
  public techSpecs = [
    { label: 'PROJECT_BIG_AGENT.SPEC_1_LABEL', value: 'PROJECT_BIG_AGENT.SPEC_1_VALUE' },
    { label: 'PROJECT_BIG_AGENT.SPEC_2_LABEL', value: 'PROJECT_BIG_AGENT.SPEC_2_VALUE' },
    { label: 'PROJECT_BIG_AGENT.SPEC_3_LABEL', value: 'PROJECT_BIG_AGENT.SPEC_3_VALUE' },
    { label: 'PROJECT_BIG_AGENT.SPEC_4_LABEL', value: 'PROJECT_BIG_AGENT.SPEC_4_VALUE' },
    { label: 'PROJECT_BIG_AGENT.SPEC_5_LABEL', value: 'PROJECT_BIG_AGENT.SPEC_5_VALUE' },
    { label: 'PROJECT_BIG_AGENT.SPEC_6_LABEL', value: 'PROJECT_BIG_AGENT.SPEC_6_VALUE' }
  ];

  public systemStates = [
    'PROJECT_BIG_AGENT.STATE_LANDED', 'PROJECT_BIG_AGENT.STATE_UP', 'PROJECT_BIG_AGENT.STATE_DOWN',
    'PROJECT_BIG_AGENT.STATE_MOVE_RIGHT', 'PROJECT_BIG_AGENT.STATE_MOVE_LEFT', 
    'PROJECT_BIG_AGENT.STATE_MOVE_FORWARD', 'PROJECT_BIG_AGENT.STATE_MOVE_BACKWARD',
    'PROJECT_BIG_AGENT.STATE_HOVERING', 'PROJECT_BIG_AGENT.STATE_LANDING'
  ];

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    this.translate.get('PROJECT_BIG_AGENT.SYSTEM_ONLINE').subscribe(title => {
      this.titleService.setTitle(`${title} | Engineering Showcase`);
    });
    this.translate.get('PROJECT_BIG_AGENT.META_DESC').subscribe(desc => {
      this.metaService.updateTag({ name: 'description', content: desc });
    });
  }

  ngAfterViewInit() {
    this.setupScrollAnimations();
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private setupScrollAnimations() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Smoothly animates elements from bottom to top as they appear on screen
          gsap.to(entry.target, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
          this.observer?.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 }); // Triggers when 15% of the element is visible

    // Gets all sections marked with the scroll-anim class
    const animElements = this.el.nativeElement.querySelectorAll('.scroll-anim');
    animElements.forEach((el: Element) => {
      gsap.set(el, { opacity: 0, y: 50 }); // Sets initial state as invisible and "sunken"
      this.observer?.observe(el);
    });
  }
}