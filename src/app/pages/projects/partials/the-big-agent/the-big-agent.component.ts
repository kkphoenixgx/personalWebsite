import { Component, inject, OnInit, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { TheEyeComponent } from './partials/the-eye/the-eye.component';
import { gsap } from 'gsap';
import { Title, Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-the-big-agent',
  standalone: true,
  imports: [CommonModule, RouterModule, TheEyeComponent],
  templateUrl: './the-big-agent.component.html',
  styleUrls: ['./the-big-agent.component.scss']
})
export class TheBigAgentComponent implements OnInit, AfterViewInit, OnDestroy {
  private darkModeService = inject(DarkModeControllerService);
  private el = inject(ElementRef);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  public isDarkMode$ = this.darkModeService.getDarkModeObserbable();

  private observer: IntersectionObserver | null = null;
  public techSpecs = [
    { label: 'Agent Architecture', value: 'BDI (Belief-Desire-Intention)' },
    { label: 'MAS Language', value: 'Jason / AgentSpeak(L)' },
    { label: 'Emulated Hardware', value: 'DJI Mavic 2 Pro' },
    { label: 'IoT Communication', value: 'ContextNet / ChonNet' },
    { label: 'Middleware', value: 'ARGO & Javino' },
    { label: 'Simulator', value: 'Webots 2023b' }
  ];

  public systemStates = [
    'LANDED', 'UP', 'DOWN', 'MOVE RIGHT', 'MOVE LEFT', 
    'MOVE FORWARD', 'MOVE BACKWARD', 'HOVERING', 'LANDING'
  ];

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    this.titleService.setTitle('The BIG Agent | Engineering Showcase');
    this.metaService.updateTag({ name: 'description', content: 'Case study: Utilization of Embedded Multi-Agent Systems in UAVs for Autonomous Operations.' });
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