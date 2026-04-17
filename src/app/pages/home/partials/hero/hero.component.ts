import { AfterViewInit, Component, ElementRef, OnInit, PLATFORM_ID, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, QueryList, ViewChildren, inject } from '@angular/core';
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
  private platformId = inject(PLATFORM_ID);

  constructor(
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
    this.tl.clear();
  }

  public animateBackground(): void {
    if (!this.animate || !this.bgImages) {
      this.removeAnimations();
      return;
    }

    this.tl.clear();
    const fallDistance = window.innerHeight + 100;

    setTimeout(() => {
      this.bgImages.forEach((imgRef) => {
        const svg = imgRef.nativeElement;
        gsap.set(svg, { pointerEvents: 'none' });

        this.tl.fromTo(svg, 
          {
            y: -150,
            x: () => gsap.utils.random(0, window.innerWidth),
            opacity: () => gsap.utils.random(0.1, 0.5),
            scale: () => gsap.utils.random(0.4, 0.9),
            rotation: () => gsap.utils.random(-90, 90)
          },
          {
            y: fallDistance,
            rotation: () => gsap.utils.random(-360, 360),
            duration: () => gsap.utils.random(10, 20), // Queda suave
            ease: "none",
            repeat: -1,
            delay: () => gsap.utils.random(0, 10)
          },
          0 // Garante que todos os tweens sejam adicionados ao tempo 0 da timeline
        );
      });
    }, 80);
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
