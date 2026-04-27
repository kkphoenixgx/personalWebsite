import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

interface PortfolioProject {
  title: string;
  description: string;
  image?: string;
  url: string;
  type: 'carousel' | 'side-left' | 'side-right' | 'card' | 'end-projects';
  highlightText?: string;
}

@Component({
  selector: 'app-portifolio',
  imports: [CommonModule, TranslateModule],
  templateUrl: './portifolio.component.html',
  styleUrl: './portifolio.component.scss'
})
export class PortifolioComponent {
  private darkModeService = inject(DarkModeControllerService);
  public darkMode$: Observable<boolean> = this.darkModeService.getDarkModeObserbable();

  projects: PortfolioProject[] = [
    {
      title: 'PORTFOLIO.PROJECTS.BIG_AGENT.TITLE',
      description: 'PORTFOLIO.PROJECTS.BIG_AGENT.DESC',
      url: 'https://github.com/LabRedesCefetRJ/The-Big-Agent',
      type: 'carousel',
      highlightText: 'PORTFOLIO.PROJECTS.BIG_AGENT.HIGHLIGHT'
    },
    {
      title: 'PORTFOLIO.PROJECTS.FOOD_ZERO.TITLE',
      description: 'PORTFOLIO.PROJECTS.FOOD_ZERO.DESC',
      url: 'https://github.com/kkphoenixgx/Restaurant-FoodZero',
      type: 'carousel',
      highlightText: 'PORTFOLIO.PROJECTS.FOOD_ZERO.HIGHLIGHT'
    },
    {
      title: 'PORTFOLIO.PROJECTS.SENCO.TITLE',
      description: 'PORTFOLIO.PROJECTS.SENCO.DESC',
      url: 'https://github.com/kkphoenixgx/senco-locacoes-website',
      type: 'carousel',
      highlightText: 'PORTFOLIO.PROJECTS.SENCO.HIGHLIGHT'
    },
    {
      title: 'PORTFOLIO.PROJECTS.POEM.TITLE',
      description: 'PORTFOLIO.PROJECTS.POEM.DESC',
      url: 'https://github.com/kkphoenixgx/Poem-site',
      type: 'carousel',
      highlightText: 'PORTFOLIO.PROJECTS.POEM.HIGHLIGHT'
    },
    {
      title: 'PORTFOLIO.PROJECTS.RANDOM_QUIZ_SPRING.TITLE',
      description: 'PORTFOLIO.PROJECTS.RANDOM_QUIZ_SPRING.DESC',
      url: 'https://github.com/kkphoenixgx/RandomQuiz-Spring-API',
      type: 'side-left',
      highlightText: 'PORTFOLIO.PROJECTS.RANDOM_QUIZ_SPRING.HIGHLIGHT'
    },
    {
      title: 'PORTFOLIO.PROJECTS.RANDOM_QUIZ_JAVA.TITLE',
      description: 'PORTFOLIO.PROJECTS.RANDOM_QUIZ_JAVA.DESC',
      url: 'https://github.com/kkphoenixgx/prog-app-corporativas--Trabalho-',
      type: 'side-right',
      highlightText: 'PORTFOLIO.PROJECTS.RANDOM_QUIZ_JAVA.HIGHLIGHT'
    },
    {
      title: 'PORTFOLIO.PROJECTS.DROPBOX.TITLE',
      description: 'PORTFOLIO.PROJECTS.DROPBOX.DESC',
      url: 'https://github.com/kkphoenixgx/DropBoxClone',
      type: 'side-left',
      highlightText: 'PORTFOLIO.PROJECTS.DROPBOX.HIGHLIGHT'
    },
    {
      title: 'PORTFOLIO.PROJECTS.TASK_APP.TITLE',
      description: 'PORTFOLIO.PROJECTS.TASK_APP.DESC',
      url: 'https://github.com/kkphoenixgx/TaskApp',
      type: 'card',
      highlightText: 'PORTFOLIO.PROJECTS.TASK_APP.HIGHLIGHT'
    },
    {
      title: 'PORTFOLIO.PROJECTS.CLI_ARCH.TITLE',
      description: 'PORTFOLIO.PROJECTS.CLI_ARCH.DESC',
      url: 'https://github.com/kkphoenixgx/createArchiteture',
      type: 'card',
      highlightText: 'PORTFOLIO.PROJECTS.CLI_ARCH.HIGHLIGHT'
    },
    {
      title: 'PORTFOLIO.PROJECTS.NODE_CRUD.TITLE',
      description: 'PORTFOLIO.PROJECTS.NODE_CRUD.DESC',
      url: 'https://github.com/kkphoenixgx/JavascriptCourse/tree/master/Projetos/ProjetoClientServer',
      type: 'side-right',
      highlightText: 'PORTFOLIO.PROJECTS.NODE_CRUD.HIGHLIGHT'
    },
    {
      title: 'PORTFOLIO.PROJECTS.DARK_THEME.TITLE',
      description: 'PORTFOLIO.PROJECTS.DARK_THEME.DESC',
      url: 'https://github.com/kkphoenixgx/darkThemeWithAngular',
      type: 'end-projects',
      highlightText: 'PORTFOLIO.PROJECTS.DARK_THEME.HIGHLIGHT'
    },
    {
      title: 'PORTFOLIO.PROJECTS.MARKDOWN_INDEX.TITLE',
      description: 'PORTFOLIO.PROJECTS.MARKDOWN_INDEX.DESC',
      url: 'https://github.com/kkphoenixgx/Create-a-index-of-files-in-md',
      type: 'card',
      highlightText: 'PORTFOLIO.PROJECTS.MARKDOWN_INDEX.HIGHLIGHT'
    },
    {
      title: 'PORTFOLIO.PROJECTS.SNAKE.TITLE',
      description: 'PORTFOLIO.PROJECTS.SNAKE.DESC',
      url: 'https://github.com/kkphoenixgx/Snake-Game',
      type: 'end-projects',
      highlightText: 'PORTFOLIO.PROJECTS.SNAKE.HIGHLIGHT'
    },
    {
      title: 'PORTFOLIO.PROJECTS.POKEDEX.TITLE',
      description: 'PORTFOLIO.PROJECTS.POKEDEX.DESC',
      url: 'https://github.com/kkphoenixgx/Pokedex-project',
      type: 'end-projects',
      highlightText: 'PORTFOLIO.PROJECTS.POKEDEX.HIGHLIGHT'
    },
    {
      title: 'PORTFOLIO.PROJECTS.CALCULATOR.TITLE',
      description: 'PORTFOLIO.PROJECTS.CALCULATOR.DESC',
      url: 'https://github.com/kkphoenixgx/CalculadoraJs',
      type: 'end-projects',
      highlightText: 'PORTFOLIO.PROJECTS.CALCULATOR.HIGHLIGHT'
    },
  ];

  carouselProjects = this.projects.filter(p => p.type === 'carousel');
  sideLeftProjects = this.projects.filter(p => p.type === 'side-left');
  sideRightProjects = this.projects.filter(p => p.type === 'side-right');
  cardProjects = this.projects.filter(p => p.type === 'card');
  endProjects = this.projects.filter(p => p.type === 'end-projects');
}
