import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export interface Job {
  company: string;
  role: string;
  period: string;
  description: string;
  achievements: string[];
}

@Component({
  selector: 'app-professional-history',
  standalone: true,
  imports: [ CommonModule, TranslateModule ],
  templateUrl: './professional-history.component.html',
  styleUrl: './professional-history.component.scss'
})
export class ProfessionalHistoryComponent {

  private darkModeService = inject(DarkModeControllerService);
  private translate = inject(TranslateService);
  public darkMode$: Observable<boolean> = this.darkModeService.getDarkModeObserbable();

  public activePage = 0; // 0 é a Capa do Livro

  // Basta adicionar novos objetos neste array para o livro criar as páginas!
  public jobs: Job[] = [
    {
      company: 'PROFESSIONAL_HISTORY.JOB_MOCK_COMPANY',
      role: 'PROFESSIONAL_HISTORY.JOB_MOCK_ROLE',
      period: 'PROFESSIONAL_HISTORY.JOB_MOCK_PERIOD',
      description: 'PROFESSIONAL_HISTORY.JOB_MOCK_DESC',
      achievements: [
        'PROFESSIONAL_HISTORY.JOB_MOCK_ACH_1',
        'PROFESSIONAL_HISTORY.JOB_MOCK_ACH_2',
        'PROFESSIONAL_HISTORY.JOB_MOCK_ACH_3'
      ]
    }
  ];

  setPage(index: number) {
    this.activePage = index;
  }
}
