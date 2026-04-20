import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ArticlesComponent } from './pages/articles/articles.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { TheBigAgentComponent } from './pages/projects/partials/the-big-agent/the-big-agent.component';
import { PersonalWebsiteComponent } from './pages/projects/partials/personal-website/personal-website.component';

export const routes: Routes = [
  { path: "", component: HomeComponent, pathMatch: 'full' },
  { path: "articles", component: ArticlesComponent, pathMatch: 'full' },
  { path: "articles/:articleSlug", component: ArticlesComponent },
  { path: "projects", component: ProjectsComponent, pathMatch: 'full' },
  { path: "projects/the-big-agent", component: TheBigAgentComponent },
  { path: "projects/personal-website", component: PersonalWebsiteComponent },
  { path: '**', component: HomeComponent }
];
