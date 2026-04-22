import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';

export interface Job {
  company: string;
  role: string;
  period: string;
  description: string;
  achievements: string[];
}

@Component({
  selector: 'app-professional-history',
  imports: [ CommonModule ],
  templateUrl: './professional-history.component.html',
  styleUrl: './professional-history.component.scss'
})
export class ProfessionalHistoryComponent {

  private darkModeService = inject(DarkModeControllerService);
  public darkMode$: Observable<boolean> = this.darkModeService.getDarkModeObserbable();

  public activePage = 0; // 0 é a Capa do Livro

  // Basta adicionar novos objetos neste array para o livro criar as páginas!
  public jobs: Job[] = [
    {
      company: 'Your Company',
      role: 'Full-Stack / Frontend Engineer',
      period: '2026 - Future',
      description: 'I am ready to architect and develop scalable digital solutions for your business, bridging the gap between immersive UI and solid software engineering.',
      achievements: [
        'Develop interactive 3D web experiences',
        'Architect robust Angular ecosystems',
        'Optimize performance and eliminate technical debt'
      ]
    }
  ];

  setPage(index: number) {
    this.activePage = index;
  }
}
