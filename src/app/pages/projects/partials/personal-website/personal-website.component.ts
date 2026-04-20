import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';

@Component({
  selector: 'app-personal-website',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <main class="project-page website-theme" [ngClass]="{'darkMode': isDarkMode$ | async, 'whiteMode': !(isDarkMode$ | async)}">
    <a routerLink="/projects" class="back-link">&larr; Back to Projects</a>
    
    <div class="hero-section">
      <h1>Personal Website & 3D Engine</h1>
      <p class="subtitle">Where WebGL meets Angular</p>
    </div>

    <section class="content-section">
      <h2>Technical Deep Dive</h2>
      <p>Merging standard web practices with cutting-edge 3D graphics and physics using Matter.js and Three.js to build a digital playground.</p>
      <!-- Aqui você detalha os shaders, física, GSAP e como evita os vazamentos de memória -->
    </section>
  </main>
  `,
  styles: [`
    .project-page {
      min-height: 85vh;
      padding: 15vh 10vw 10vh 10vw;
      font-family: "Merriweather", serif;
      transition: background-color 0.5s ease, color 0.5s ease;
    }
    .website-theme.darkMode { background-color: #2c003e; color: #f5f5f5; }
    .website-theme.whiteMode { background-color: #fdfcf8; color: #3a0052; }
    
    .back-link { font-family: sans-serif; font-weight: bold; text-decoration: none; color: inherit; opacity: 0.8; }
    .back-link:hover { opacity: 1; text-decoration: underline; }

    .hero-section { display: flex; flex-direction: column; align-items: flex-end; margin-top: 4rem; margin-bottom: 4rem; border-right: 4px solid #9100a6; padding-right: 2rem; text-align: right; }
    h1 { font-size: 3.5rem; margin: 0; }
    .subtitle { font-size: 1.2rem; font-style: italic; color: #d47fe0; margin-top: 10px; }
    .website-theme.whiteMode .subtitle { color: #9100a6; }

    .content-section { font-size: 1.2rem; line-height: 1.8; }
    .content-section h2 { font-size: 2.2rem; font-family: sans-serif; margin-bottom: 1.5rem; }
  `]
})
export class PersonalWebsiteComponent implements OnInit {
  private darkModeService = inject(DarkModeControllerService);
  public isDarkMode$ = this.darkModeService.getDarkModeObserbable();

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }
}