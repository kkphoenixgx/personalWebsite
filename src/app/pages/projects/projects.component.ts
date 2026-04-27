import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DarkModeControllerService } from '../../services/dark-mode-controller.service';
import { RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss'
})
export class ProjectsComponent implements OnInit {
  private darkModeService = inject(DarkModeControllerService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private translate = inject(TranslateService);
  public isDarkMode$ = this.darkModeService.getDarkModeObserbable();

  ngOnInit() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    this.translate.get('PROJECTS_PAGE.TITLE').subscribe(title => {
      this.titleService.setTitle(`${title} | K. Phoenix`);
    });
    this.translate.get('PROJECTS_PAGE.SUBTITLE').subscribe(subtitle => {
      this.metaService.updateTag({ name: 'description', content: subtitle });
    });
  }

  public projects: IProjectCase[] = [
    {
      title: 'PROJECTS_PAGE.P1_TITLE',
      context: 'PROJECTS_PAGE.P1_CONTEXT',
      architecture: 'PROJECTS_PAGE.P1_ARCH',
      techStack: ['Angular 19', 'Three.js', 'Matter.js', 'RxJS', 'SCSS', 'GSAP'],
      internalRoute: '/projects/personal-website'
    },
    {
      title: 'PROJECTS_PAGE.P2_TITLE',
      context: 'PROJECTS_PAGE.P2_CONTEXT',
      architecture: 'PROJECTS_PAGE.P2_ARCH',
      techStack: [ 'Java', 'AgentSpeak', 'MAS (Multi-Agent Systems)', 'AOP (Agent Oriented Programming)'],
      internalRoute: '/projects/the-big-agent'
    },
    {
      title: 'PROJECTS_PAGE.P3_TITLE',
      context: 'PROJECTS_PAGE.P3_CONTEXT',
      architecture: 'PROJECTS_PAGE.P3_ARCH',
      techStack: ['TypeScript', 'Custom Engine', 'Zero-GC', 'Web Workers', 'Ollama (LLM)'],
      internalRoute: '/projects/rpg-roguelite-bullethell'
    },
  ];
}
