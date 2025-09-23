import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { Observable } from 'rxjs';

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
  imports: [CommonModule],
  templateUrl: './portifolio.component.html',
  styleUrl: './portifolio.component.scss'
})
export class PortifolioComponent {
  private darkModeService = inject(DarkModeControllerService);
  public darkMode$: Observable<boolean> = this.darkModeService.getDarkModeObserbable();

  projects: PortfolioProject[] = [
    {
      title: 'The Big Agent (Embedded MAS)',
      description: 'A multi-agent system inspired by George Orwell\'s 1984. One agent simulates a secretary sending paths to drones, while another agent is a drone navigating those paths. Cutting-edge AI embedded simulation.',
      url: 'https://github.com/LabRedesCefetRJ/The-Big-Agent',
      type: 'carousel',
      highlightText: 'Revolutionizing agent-based simulations with embedded AI.'
    },
    {
      title: 'Restaurant Food Zero (Vue Frontend)',
      description: 'A modern restaurant website with blog, posts, and reservation system. Built with Vue.js for a smooth user experience.',
      url: 'https://github.com/kkphoenixgx/RestaurantFoodZeroFrontEnd',
      type: 'carousel',
      highlightText: 'Elevating restaurant web presence with Vue.'
    },
    {
      title: 'Restaurant Food Zero (Node Backend)',
      description: 'The backend powering Food Zero, built with Node.js for fast and scalable restaurant management.',
      url: 'https://github.com/kkphoenixgx/backendRestaurantFoodZero',
      type: 'carousel',
      highlightText: 'Robust backend for modern restaurant solutions.'
    },
    {
      title: 'Poem Site (React Frontend)',
      description: 'A web app to create, edit, and perfect poems for mobile screens, making sharing on social media easier than ever.',
      url: 'https://github.com/kkphoenixgx/Poem-site',
      type: 'carousel',
      highlightText: 'Poetry meets technology for social sharing.'
    },
    {
      title: 'Poem Site (Node Server)',
      description: 'The Node.js server powering Poem Site, enabling seamless poem management and sharing.',
      url: 'https://github.com/kkphoenixgx/server-poem-site',
      type: 'carousel',
      highlightText: 'Backend for creative expression.'
    },
    {
      title: 'RandomQuiz Spring API',
      description: 'A robust Spring Boot server for creating and saving random quizzes. Features Swagger documentation and MySQL integration for seamless quiz management.',
      url: 'https://github.com/kkphoenixgx/RandomQuiz-Spring-API',
      type: 'side-left',
      highlightText: 'Empowering quiz creation with enterprise-grade backend.'
    },
    {
      title: 'RandomQuiz Java EE',
      description: 'Java Enterprise Edition version of RandomQuiz, fully dockerized, with JUnit tests and MySQL database. Built from scratch for maximum control and reliability.',
      url: 'https://github.com/kkphoenixgx/prog-app-corporativas--Trabalho-',
      type: 'side-right',
      highlightText: 'Enterprise-level quiz management with modern DevOps.'
    },
    {
      title: 'DropBox Clone',
      description: 'A full-featured DropBox clone, demonstrating cloud storage concepts and file management.',
      url: 'https://github.com/kkphoenixgx/DropBoxClone',
      type: 'side-left',
      highlightText: 'Cloud storage, reimagined for learning.'
    },
    {
      title: 'Task Manager Angular',
      description: 'A task management app built with Angular for productivity and organization.',
      url: 'https://github.com/kkphoenixgx/TaskApp',
      type: 'card',
      highlightText: 'Boost your productivity.'
    },
    {
      title: 'Custom Project Architecture CLI',
      description: 'A Node.js CLI to create customizable project architectures.',
      url: 'https://github.com/kkphoenixgx/createArchiteture',
      type: 'card',
      highlightText: 'Structure your projects your way.'
    },
    {
      title: 'Node RESTful CRUD Server',
      description: 'A RESTful CRUD server built with Node.js, demonstrating API fundamentals.',
      url: 'https://github.com/kkphoenixgx/JavascriptCourse/tree/master/Projetos/ProjetoClientServer',
      type: 'side-right',
      highlightText: 'Learn RESTful APIs by example.'
    },
    {
      title: 'Dark Theme Angular',
      description: 'Angular app with dark theme, login system, and guards. A showcase of modern UI/UX and security.',
      url: 'https://github.com/kkphoenixgx/darkThemeWithAngular',
      type: 'end-projects',
      highlightText: 'Beautiful, secure, and user-friendly.'
    },
    {
      title: 'Markdown Index Creator',
      description: 'A Node.js CLI tool to create indexes of files in markdown format.',
      url: 'https://github.com/kkphoenixgx/Create-a-index-of-files-in-md',
      type: 'card',
      highlightText: 'Automate your documentation.'
    },
    {
      title: 'Snake Game',
      description: 'A classic snake game built in JavaScript. Simple, fun, and nostalgic.',
      url: 'https://github.com/kkphoenixgx/Snake-Game',
      type: 'end-projects',
      highlightText: 'Retro gaming for web.'
    },
    {
      title: 'Pokedex Angular',
      description: 'A Pokédex built with Angular, featuring Pokémon data and search capabilities.',
      url: 'https://github.com/kkphoenixgx/Pokedex-project',
      type: 'end-projects',
      highlightText: 'Pokémon exploration with Angular.'
    },
    {
      title: 'Simple Calculator JS',
      description: 'A simple calculator built in JavaScript for quick calculations.',
      url: 'https://github.com/kkphoenixgx/CalculadoraJs',
      type: 'end-projects',
      highlightText: 'Quick and easy calculations.'
    },
  ];

  carouselProjects = this.projects.filter(p => p.type === 'carousel');
  sideLeftProjects = this.projects.filter(p => p.type === 'side-left');
  sideRightProjects = this.projects.filter(p => p.type === 'side-right');
  cardProjects = this.projects.filter(p => p.type === 'card');
  endProjects = this.projects.filter(p => p.type === 'end-projects');
}
