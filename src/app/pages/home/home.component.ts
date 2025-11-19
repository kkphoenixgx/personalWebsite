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
import { ProfessionalHistoryComponent } from './partials/professional-history/professional-history.component';
import { PortifolioComponent } from './partials/portifolio/portifolio.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule,
    HireMeComponent, HistoryComponent, PortifolioComponent, ProfessionalHistoryComponent
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
    "angular", "bootstrap", "c", "csharp", "css", "docker", "electron", "express", "flutter", "git", "html", "java", "spring", "jest", "jquery", "js", "linux", "sql", "mysql", "mongodb", "nest", "node", "php", "prisma", "prometheus", "react", "vue", "saas", "treejs", "ts"
  ];
  
  public tl: GSAPTimeline = gsap.timeline({});

  constructor(
    @Inject(PLATFORM_ID) private PLATAFORM_ID: Object,
    private animationService: AnimationControllerService,
    private darkModeService: DarkModeControllerService,
    private render: Renderer2
  ) 
  { this.initOnConstructor(); }

  // ----------- Methods -----------

  private initOnConstructor(){
    this.startGsap();
  }
  public startGsap(){
    this.tl = gsap.timeline({ 
      repeat: -1, 
      yoyo: false, 
      delay: (this.animationService.animationDelayInMs/1000) + 2
    });
  }

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
    if (!this.animate) this.tl.clear();
    else {
      const svgElements: NodeListOf<HTMLElement> = document.querySelectorAll(".background img");
      this.tl.clear();

      setTimeout(() => {
        svgElements.forEach((svg: HTMLElement, index: number) => {
          svg.style.pointerEvents = 'none'; // evita capturar eventos de touch
          gsap.set(svg, { pointerEvents: 'none' });

          const effect = Math.floor(Math.random() * 3); // 0, 1 ou 2
          const fixedDuration = 4;

          switch (effect) {

            case 0: // queda
              this.tl.to(svg, {
                y: this.maxHeightBackground,
                rotation: gsap.utils.random(-180, 180),
                duration: fixedDuration,
                ease: "power1.in"
              }, index * 0.5);
              break;

            case 1: // pulo
              this.tl.to(svg, {
                y: -200,
                scale: 1.3,
                rotation: gsap.utils.random(-90, 90),
                duration: fixedDuration,
                ease: "bounce.out"
              }, index * 0.5);
              break;

            case 2: // queda rodando
              this.tl.to(svg, {
                y: this.maxHeightBackground,
                rotation: 720,
                scale: 0.6,
                duration: fixedDuration,
                ease: "circ.in"
              }, index * 0.5);
              break;

            default:
              break;
          }
        });
      }, 80);
    }
  }


  public generateBackground(): void {
    
    if (!isPlatformBrowser(this.PLATAFORM_ID) && this.readyToContent ) return;

    setTimeout(()=>{

      this.listOfFrameworks.forEach(language => {
        let image = this.render.createElement("img");
        this.render.setAttribute(image, 'src', `/assets/svg/${language}.svg`); 
      
        if (this.helloBackgroundDiv.nativeElement)
          this.render.appendChild(this.helloBackgroundDiv.nativeElement, image);  

      });
        
      this.animateBackground();
    }, 0)

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
    this.animationService.getAnimationObserbable().subscribe(state => {
      this.animate = state;
      
      if(!this.animate) this.removeAnimations();
      if(this.readyToContent && this.animate) this.generateBackground();
    });
    this.darkModeService.getDarkModeObserbable().subscribe(state => {
      this.isDarkMode = state;
    });
  }

  ngAfterViewInit(): void {
    this.lastTab = this.firstTab.nativeElement;
    let fullText: string = 
      "Wellcome!! My name is Kauã Alves Santos, I am a fullstack web developer. Please checkout my portfolio and enjoy my site.";
  
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
