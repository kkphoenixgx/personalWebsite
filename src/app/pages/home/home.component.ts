import { AfterViewInit, Component, ElementRef, Inject, OnInit, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

// Serviços
import { AnimationControllerService } from '../../services/animation-controller.service';
import { DarkModeControllerService } from '../../services/dark-mode-controller.service';

// Frameworks
import gsap from "gsap"
import { HireMeComponent } from './partials/hire-me/hire-me.component';
import { HistoryComponent } from './partials/history/history.component';
import { ProfissionalHistoryComponent } from './partials/profissional-history/profissional-history.component';
import { PortifolioComponent } from './partials/portifolio/portifolio.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, 
    HireMeComponent, HistoryComponent, PortifolioComponent, ProfissionalHistoryComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  public text :string = "";

  @ViewChild('firstTab') firstTab!: ElementRef;
  @ViewChild('helloBackground') helloBackgroundDiv!: ElementRef;

  public lastTab! :HTMLElement;
  public currentTab :string | undefined = "History";

  public readyToContent: boolean = false;
  
  public animate: boolean = true;
  public isDarkMode: boolean = true;
  
  private maxHeightBackground: number = 550;
  
  public listOfFrameworks: Array<String> = [
    "angular", "bootstrap", "c", "csharp", "css", "docker", "electron", "express", "flutter", "git", "html", "java", "jest", "jquery", "js", "linux", "mongodb", "nest", "node", "php", "prisma", "prometheus", "react", "saas", "treejs", "ts"
  ];
  
  public tl;

  constructor(
    private animationService: AnimationControllerService,
    private darkModeService: DarkModeControllerService,
    @Inject(PLATFORM_ID) private PLATAFORM_ID: Object,
    private render: Renderer2
  ) {
    this.tl = gsap.timeline({ 
      repeat: -1, 
      yoyo: false, 
      delay: (this.animationService.animationDelayInMs/1000) + 2
    });
  }

  // ----------- Methods -----------

  public typeWriter(txt: string, speed: number, i: number = 0): void {
    if (i < txt.length) {
      this.text += txt.charAt(i);
      i++;
      setTimeout(() => this.typeWriter(txt, speed, i), speed);
    }
  }

  public removeAnimations(): void {
    if (!this.animate) {
      const arrImages: NodeListOf<Element> = document.querySelectorAll(".background img");

      arrImages.forEach(img => {
        img.classList.remove("applyAnimation");
        img.classList.add("removeAnimation");
      });
    }
  }

  public animateBackground(): void {
    if (isPlatformBrowser(this.PLATAFORM_ID)) {
      
    if (!this.animate) this.tl.clear();
    else {

      const svgElements: NodeListOf<Element> = document.querySelectorAll(".background img");

      setTimeout(() => {
        svgElements.forEach((svg: Element, index: number) => {
          this.tl.to(svg, {
            y: 750,             // translateY(550px)
            duration: 5,        // Duração
            ease: "linear"      // Suavização
          },
            index * 0.8);      // Delay
        });
        
      }, 80);

    }
    }
  }

  public generateBackground(): void {
    
    if (!isPlatformBrowser(this.PLATAFORM_ID) && this.readyToContent ) return;

    setTimeout(()=>{

      this.listOfFrameworks.forEach(language => {
        let image = this.render.createElement("img");
        this.render.setAttribute(image, 'src', `assets/svg/${language}.svg`); 
      
        if (this.helloBackgroundDiv.nativeElement)
          this.render.appendChild(this.helloBackgroundDiv.nativeElement, image);  

      });
        
      this.animateBackground();
    }, this.animationService.animationDelayInMs)

  }

  public handleHistoryLiClick(event: Event): void {
    const target = event.target as HTMLElement;

    if (this.lastTab) this.lastTab.classList.remove("currentTab");
    
    this.lastTab = target;
    this.lastTab.classList.add("currentTab");
    this.currentTab = target.dataset['tab'];

  }

  // ----------- Lifecycle -----------

  ngOnInit(): void {
    // ----------- Observers -----------
    this.animationService.getAnimationState().subscribe(state => {
      this.animate = state;
      
      if(!this.animate) this.removeAnimations();
      if(this.readyToContent && this.animate) this.generateBackground();
    });
    this.darkModeService.getDarkModeState().subscribe(state => {
      this.isDarkMode = state;
    });
  }

  ngAfterViewInit(): void {
    this.lastTab = this.firstTab.nativeElement;
    let fullText: string = 
      "Wellcome!! My name is Kauã Alves Santos, I am a fullstack web developer, please checkout my portfolio and enjoy my site.";
  
    setTimeout(() => {
      this.readyToContent = true;

      if (this.animate) this.typeWriter(fullText, 100);
      
      if (this.helloBackgroundDiv) {
        this.helloBackgroundDiv.nativeElement!.style.maxHeight = `${this.maxHeightBackground}px`;
      }

      // Gera o fundo com lazy loading
      this.generateBackground();
    }, this.animationService.animationDelayInMs);
  }
}
