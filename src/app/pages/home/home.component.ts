import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Frameworks
import { HireMeComponent } from './partials/hire-me/hire-me.component';
import { HistoryComponent } from './partials/history/history.component';
import { ProfessionalHistoryComponent } from './partials/professional-history/professional-history.component';
import { PortifolioComponent } from './partials/portifolio/portifolio.component';
// Importando HeroComponent explicitamente para uso no template
import { HeroComponent } from './partials/hero/hero.component';
import { DarkModeControllerService } from '../../services/dark-mode-controller.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule,
    HireMeComponent, HistoryComponent, PortifolioComponent, ProfessionalHistoryComponent,
    HeroComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {

  @ViewChild('firstTab') firstTab!: ElementRef;

  public lastTab! :HTMLElement;
  public currentTab :string | undefined = "History";

  constructor(
    public darkModeService: DarkModeControllerService
  ) { }

  public handleHistoryLiClick(event: Event): void {
    const target = event.target as HTMLElement;

    if (this.lastTab) this.lastTab.classList.remove("currentTab");
    
    this.lastTab = target;
    this.lastTab.classList.add("currentTab");
    this.currentTab = target.dataset['tab'];

  }

  // ----------- Lifecycle -----------

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.lastTab = this.firstTab.nativeElement;
  }
}
