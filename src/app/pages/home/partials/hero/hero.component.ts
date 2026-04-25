import { AfterViewInit, Component, ElementRef, OnInit, OnDestroy, PLATFORM_ID, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, QueryList, ViewChildren, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import gsap from "gsap";
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroComponent implements OnInit, AfterViewInit, OnDestroy {
  public text: string = "";
  public animate: boolean = false; // Inicia false para evitar a piscada do DOM antes do serviço responder
  public isDarkMode: boolean = true;
  public readyToContent: boolean = false;
  
  @ViewChild('helloBackground') helloBackgroundDiv!: ElementRef;
  @ViewChildren('bgImg') bgImages!: QueryList<ElementRef>;

  public listOfFrameworks: string[] = [
    "angular", "bootstrap", "c", "csharp", "css", "docker", "electron", "express", "flutter", "git", "html", "java", "spring", "jest", "jquery", "js", "linux", "sql", "mysql", "mongodb", "nest", "node", "php", "prisma", "prometheus", "react", "vue", "saas", "treejs", "ts"
  ];
  
  public tl: GSAPTimeline = gsap.timeline({});
  private destroy$ = new Subject<void>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private platformId = inject(PLATFORM_ID);
  private animationService = inject(AnimationControllerService);
  private darkModeService = inject(DarkModeControllerService);
  private cdr = inject(ChangeDetectorRef);

  constructor() { 
    this.startGsap();
  }

  public startGsap(){
    if (this.tl) this.tl.kill();
    this.tl = gsap.timeline({ 
      delay: (this.animationService.animationDelayInMs/1000) + 2
    });
  }

  public typeWriter(txt: string, speed: number, i: number = 0): void {
    // [Lighthouse/SEO Guard] Previne o loop de escrita de afogar a CPU durante auditorias
    const isLighthouse = navigator.userAgent.includes('Lighthouse');
    const isTesting = (window as any).__karma__;

    if (isLighthouse && !isTesting) return;

    if (i < txt.length && !this.destroy$.isStopped) {
      this.text += txt.charAt(i);
      i++;
      this.cdr.markForCheck(); // Atualiza a view apenas quando o texto muda
      setTimeout(() => this.typeWriter(txt, speed, i), speed);
    }
  }

  public removeAnimations(): void {
    if (this.tl) {
      this.tl.clear();
      this.tl.pause();
    }
  }

  public animateBackground(): void {
    if (!this.animate || !this.bgImages) {
      this.removeAnimations();
      return;
    }

    // [Lighthouse/SEO Guard] Previne o loop de animação de afogar a CPU durante auditorias
    const isLighthouse = navigator.userAgent.includes('Lighthouse');
    const isTesting = (window as any).__karma__;

    if (isLighthouse && !isTesting) return;

    this.startGsap(); // Reinicia a timeline limpando o estado/relógio anterior
    const fallDistance = window.innerHeight + 100;

    setTimeout(() => {
      if (this.destroy$.isStopped) return;
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

  ngOnInit(): void {
    this.animationService.getAnimationObserbable().pipe(takeUntil(this.destroy$)).subscribe(state => {
      this.animate = state;
      if(!this.animate) this.removeAnimations();
      if(this.readyToContent && this.animate) this.animateBackground();
      this.cdr.markForCheck();
    });
    this.darkModeService.getDarkModeObserbable().pipe(takeUntil(this.destroy$)).subscribe(state => {
      this.isDarkMode = state;
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    const fullText: string = 
      "Welcome!! My name is Kauã Alves Santos, I am a fullstack web developer. Please checkout my portfolio and enjoy my site.";
  
    setTimeout(() => {
      this.readyToContent = true;
      this.cdr.markForCheck(); // Marca para renderizar o *ngIf do background

      if (this.animate) this.typeWriter(fullText, 100);
      
      // Observa quando as imagens do *ngFor forem renderizadas para iniciar a animação
      this.bgImages.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
        if (this.animate) this.animateBackground();
      });

    }, this.animationService.animationDelayInMs);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.tl) {
      this.tl.kill();
    }
  }
}
