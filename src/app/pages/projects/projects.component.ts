import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DarkModeControllerService } from '../../services/dark-mode-controller.service';
import { RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';

interface IProjectCase {
  title: string;
  context: string;
  architecture: string;
  techStack: string[];
  internalRoute?: string;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {
  private darkModeService = inject(DarkModeControllerService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  public isDarkMode$ = this.darkModeService.getDarkModeObserbable();

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    this.titleService.setTitle('Architecture & Projects | K. Phoenix');
    this.metaService.updateTag({ name: 'description', content: 'Deep dives into the systems I\'ve designed and the technical decisions behind them.' });
  }

  public projects: IProjectCase[] = [
    {
      title: 'Personal Website with 3D',
      context: 'A highly interactive portfolio aiming to merge standard web practices with cutting-edge 3D graphics and physics, creating a memorable experience without sacrificing accessibility or performance.',
      architecture: 'Built as an Angular 19 SPA. It integrates Three.js for WebGL rendering (including post-processing with EffectComposer) and Matter.js for 2D physics. Heavy use of RxJS for state management (like global Dark Mode and Animation limits) and memory cleanup to prevent GPU leaks during route transitions.',
      techStack: ['Angular 19', 'Three.js', 'Matter.js', 'RxJS', 'SCSS', 'GSAP'],
      internalRoute: '/projects/personal-website'
    },
    {
      title: 'The Big Agent (Embedded MAS)',
      context: 'A multi-agent system inspired by George Orwell\'s 1984. The goal was to simulate an environment where agents possess embedded artificial intelligence capable of complex navigation, decision-making, and communication without a central orchestrator.',
      architecture: 'Developed with a heavily decoupled architecture. The cognitive backend was built in Python/Java to handle BDI (Belief-Desire-Intention) agent logic, while the physical simulation layer runs on Unity/Three.js. They communicate asynchronously, respecting the strict sensor-actuator loop constraints.',
      techStack: [ 'Java', 'AgentSpeak', 'MAS (Multi-Agent Systems)', 'AOP (Agent Oriented Programming)'],
      internalRoute: '/projects/the-big-agent'
    },
    {
      title: 'A Marionete (RPG Roguelite Bullet-Hell)',
      context: 'Um jogo indie em pleno desenvolvimento ativo. Você joga como um boneco de pano do Gepeto, sobrevivendo a um caos de projéteis, participando da Academia de Magia e navegando entre o mundo real 3D e os sonhos do boneco de pano. Possui um sistema rico de Multiclasse e NPCs controlados por Inteligência Artificial generativa.',
      architecture: 'Engine 100% Própria construída do zero em TypeScript puro. Para suportar milhares de elementos simultâneos a 60 FPS, utiliza uma arquitetura extrema de Zero-Garbage Collection (Zero-GC) e descarrega a matemática de colisões espaciais (SAT) em Web Workers paralelos.',
      techStack: ['TypeScript', 'Custom Engine', 'Zero-GC', 'Web Workers', 'Ollama (LLM)'],
      internalRoute: '/projects/rpg-roguelite-bullethell'
    },
  ];
}