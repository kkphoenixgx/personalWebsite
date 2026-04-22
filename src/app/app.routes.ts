import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ArticlesComponent } from './pages/articles/articles.component';
import { ProjectsComponent } from './pages/projects/projects.component';
import { TheBigAgentComponent } from './pages/projects/partials/the-big-agent/the-big-agent.component';
import { PersonalWebsiteComponent } from './pages/projects/partials/personal-website/personal-website.component';
import { RpgRogueliteBullethellComponent } from './pages/projects/partials/rpg-roguelite-bullethell/rpg-roguelite-bullethell.component';

export const routes: Routes = [
  { path: "", component: HomeComponent, pathMatch: 'full' },
  { path: "articles", component: ArticlesComponent, pathMatch: 'full' },
  { path: "articles/:articleSlug", component: ArticlesComponent },
  { path: "projects", children: [
    { path: "", component: ProjectsComponent, pathMatch: 'full' },
    { path: "the-big-agent", component: TheBigAgentComponent },
    { path: "personal-website", component: PersonalWebsiteComponent },
    { path: "rpg-roguelite-bullethell", component: RpgRogueliteBullethellComponent }
  ]},
  { path: '**', component: HomeComponent }
];
