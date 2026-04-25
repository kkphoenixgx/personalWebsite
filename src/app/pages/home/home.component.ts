import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Frameworks
import { HireMeComponent } from './partials/hire-me/hire-me.component';
import { HistoryComponent } from './partials/history/history.component';
import { ProfessionalHistoryComponent } from './partials/professional-history/professional-history.component';
import { PortifolioComponent } from './partials/portifolio/portifolio.component';
// Importando HeroComponent explicitamente para uso no template
import { HeroComponent } from './partials/hero/hero.component';
import { HelloComponent } from './partials/hello/hello.component';
import { DarkModeControllerService } from '../../services/dark-mode-controller.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule,
    HireMeComponent, HistoryComponent, PortifolioComponent, ProfessionalHistoryComponent,
    HeroComponent, HelloComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {

  @ViewChild('firstTab') firstTab!: ElementRef;

  public lastTab!: HTMLElement;
  public currentTab: string | undefined = "Hello";

  public darkModeService = inject(DarkModeControllerService);

  public handleHistoryLiClick(event: Event): void {
    const target = event.currentTarget as HTMLElement; // currentTarget garante que será o <button> com o atributo data-tab

    if (this.lastTab) this.lastTab.classList.remove("currentTab");
    
    this.lastTab = target;
    this.lastTab.classList.add("currentTab");
    this.currentTab = target.dataset['tab'];

  }

  // ----------- Lifecycle -----------

  ngAfterViewInit(): void {
    this.lastTab = this.firstTab.nativeElement;
  }
}
