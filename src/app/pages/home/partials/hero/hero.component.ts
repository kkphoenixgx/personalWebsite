import { AfterViewInit, Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import gsap from "gsap";

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroComponent implements OnInit, AfterViewInit {
  public text: string = "";
  public animate: boolean = true;
  public isDarkMode: boolean = true;
  public readyToContent: boolean = false;
  
  @ViewChild('helloBackground') helloBackgroundDiv!: ElementRef;
  @ViewChildren('bgImg') bgImages!: QueryList<ElementRef>;

  public listOfFrameworks: Array<String> = [
    "angular", "bootstrap", "c", "csharp", "css", "docker", "electron", "express", "flutter", "git", "html", "java", "spring", "jest", "jquery", "js", "linux", "sql", "mysql", "mongodb", "nest", "node", "php", "prisma", "prometheus", "react", "vue", "saas", "treejs", "ts"
  ];
  
  public tl: GSAPTimeline = gsap.timeline({});

  constructor(
    @Inject(PLATFORM_ID) private PLATAFORM_ID: Object,
    private animationService: AnimationControllerService,
    private darkModeService: DarkModeControllerService,
    private cdr: ChangeDetectorRef
  ) { 
    this.initOnConstructor(); 
  }

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
      this.cdr.markForCheck(); // Atualiza a view apenas quando o texto muda
      setTimeout(() => this.typeWriter(txt, speed, i), speed);
    }
  }

  public removeAnimations(): void {
    if (!this.animate && this.bgImages) {
      this.bgImages.forEach(imgRef => {
        const img = imgRef.nativeElement;
        img.classList.remove("applyAnimation");
        img.classList.add("removeAnimation");
      });
    }
  }

  public animateBackground(): void {
    if (!this.animate || !this.bgImages) this.tl.clear();
    else {
      this.tl.clear();

      const fallDistance = window.innerHeight + 100;

      setTimeout(() => {
        this.bgImages.forEach((imgRef, index) => {
          const svg = imgRef.nativeElement;
          svg.style.pointerEvents = 'none'; 
          gsap.set(svg, { pointerEvents: 'none' });

          const effect = Math.floor(Math.random() * 3); 
          const fixedDuration = 4;

          switch (effect) {
            case 0: 
              this.tl.to(svg, {
                y: fallDistance,
                rotation: gsap.utils.random(-180, 180),
                duration: fixedDuration,
                ease: "power1.in"
              }, index * 0.5);
              break;
            case 1: 
              this.tl.to(svg, {
                y: -200,
                scale: 1.3,
                rotation: gsap.utils.random(-90, 90),
                duration: fixedDuration,
                ease: "bounce.out"
              }, index * 0.5);
              break;
            case 2: 
              this.tl.to(svg, {
                y: fallDistance,
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
    // A geração agora é feita via *ngFor no template.
    // A animação será disparada via subscription do bgImages.changes ou após o view init.
  }

  ngOnInit(): void {
    this.animationService.getAnimationObserbable().subscribe(state => {
      this.animate = state;
      if(!this.animate) this.removeAnimations();
      if(this.readyToContent && this.animate) this.generateBackground();
      this.cdr.markForCheck();
    });
    this.darkModeService.getDarkModeObserbable().subscribe(state => {
      this.isDarkMode = state;
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    let fullText: string = 
      "Welcome!! My name is Kauã Alves Santos, I am a fullstack web developer. Please checkout my portfolio and enjoy my site.";
  
    setTimeout(() => {
      this.readyToContent = true;
      this.cdr.markForCheck(); // Marca para renderizar o *ngIf do background

      if (this.animate) this.typeWriter(fullText, 100);
      
      // Observa quando as imagens do *ngFor forem renderizadas para iniciar a animação
      this.bgImages.changes.subscribe(() => {
        if (this.animate) this.animateBackground();
      });

    }, this.animationService.animationDelayInMs);
  }
}
