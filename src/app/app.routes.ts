import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ArticlesComponent } from './pages/articles/articles.component';

export const routes: Routes = [
  { path: "", component: HomeComponent, pathMatch: 'full' },
  { path: "articles", component: ArticlesComponent, pathMatch: 'full' },
  { path: '**', component: HomeComponent }
];
