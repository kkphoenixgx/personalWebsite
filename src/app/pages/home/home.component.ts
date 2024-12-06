import { AfterViewInit, Component, ElementRef, Inject, OnInit, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

// Serviços
import { AnimationControllerService } from '../../service/animation-controller.service';
import { DarkModeControllerService } from '../../service/dark-mode-controller.service';

// Frameworks
import gsap from "gsap"

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  public text :string = "";

  @ViewChild('firstTab') firstTab!: ElementRef;
  @ViewChild('helloBackground') helloBackgroundDiv!: ElementRef;

  public lastTab!: HTMLElement;

  public readyToContent: boolean = false;
  
  public animate: boolean = true;
  public isDarkMode: boolean = true;
  
  public tl = gsap.timeline({ repeat: -1, yoyo: false });

  private maxHeightBackground: number = 550;

  public listOfFrameworks: Array<String> = ["angular", "bootstrap", "c", "csharp", "css", "docker", "electron", "express", "flutter", "git", "html", "java", "jest", "jquery", "js", "linux", "mongodb", "nest", "node", "php", "prisma", "prometheus", "react", "saas", "treejs", "ts"];

  constructor(
    private animationService: AnimationControllerService,
    private darkModeService: DarkModeControllerService,
    @Inject(PLATFORM_ID) private PLATAFORM_ID: Object,
    private render: Renderer2
  ) {}

  public typeWriter(txt: string, speed: number, i: number = 0): void {
    if (i < txt.length) {
      this.text += txt.charAt(i);
      i++;
      setTimeout(() => this.typeWriter(txt, speed, i), speed);
    }
  }

  public removeAnimations(arrSvg: NodeListOf<Element>): void {
    if (!this.animate) {
      arrSvg.forEach(svg => {
        svg.classList.remove("applyAnimation");
        svg.classList.add("removeAnimation");
      });
    }
  }

  public animateBackground(): void {
    if (isPlatformBrowser(this.PLATAFORM_ID)) {
      const svgElements: NodeListOf<Element> = document.querySelectorAll(".background svg");

      if (!this.animate) this.tl.clear();
      else {
        svgElements.forEach((svg: Element, index: number) => {
          this.tl.to(svg, {
            y: 550,             // translateY(550px)
            duration: 5,        // Duração
            ease: "linear"      // Suavização
          },
            index * 0.8);      // Delay
        });
      }
    }
  }

  public generateBackground(): void {
    if (isPlatformBrowser(this.PLATAFORM_ID)) {

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.listOfFrameworks.forEach(language => {

              let image = this.render.createElement("img");

              this.render.setAttribute(image, 'src', `assets/svg/${language}.svg`);
              this.render.setStyle(image, 'position', 'absolute');
              this.render.setStyle(image, 'top', '0');
              this.render.setStyle(image, 'transition', 'transform 5s linear');
              

              if (this.helloBackgroundDiv.nativeElement) {
                this.render.appendChild(this.helloBackgroundDiv.nativeElement, image);
              }
            });
            observer.unobserve(entry.target);
          }
        });
      });

      observer.observe(this.helloBackgroundDiv.nativeElement);
    }
  }

  public handleHistoryLiClick(event: Event): void {
    const target = event.target as HTMLElement;
    
    if (this.lastTab) this.lastTab.classList.remove("currentTab");
    
    this.lastTab = target;
    this.lastTab.classList.add("currentTab");
  }

  ngOnInit(): void {
    // ----------- Observers -----------
    this.animationService.getAnimationState().subscribe(state => {
      this.animate = state;
      this.animateBackground();
    });
    this.darkModeService.getDarkModeState().subscribe(state => {
      this.isDarkMode = state;
    });
  }

  ngAfterViewInit(): void {
    this.lastTab = this.firstTab.nativeElement;
    let fullText: string = 
      "Wellcome!! My name is Kauã Alves Santos, I am a fullstack web developer, please checkout my portfolio and enjoy my site.";
    
    // home component background 

    setTimeout(() => {
      this.readyToContent = true;

      if (this.animate) this.typeWriter(fullText, 100);
      
      if (this.helloBackgroundDiv) {
        this.helloBackgroundDiv.nativeElement!.style.maxHeight = `${this.maxHeightBackground}px`;
      }

      // Gera o fundo com lazy loading
      this.generateBackground();
    }, 5000);
  }
}
