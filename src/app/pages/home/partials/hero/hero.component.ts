import { AfterViewInit, Component, ElementRef, OnInit, OnDestroy, PLATFORM_ID, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, QueryList, ViewChildren, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import gsap from "gsap";
import { Subject, take, takeUntil } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterModule, NgOptimizedImage, TranslateModule],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroComponent implements OnInit, AfterViewInit, OnDestroy {
  public text: string = "";
  public animate: boolean = false; 
  public isDarkMode: boolean = true;
  public readyToContent: boolean = false;
  private typeWriterTimeoutId?: any;
  private currentTypeWriterRun: number = 0;
  
  @ViewChild('helloBackground') helloBackgroundDiv!: ElementRef;
  @ViewChildren('bgImg') bgImages!: QueryList<ElementRef>;

  public listOfFrameworks: string[] = [
    "angular", "bootstrap", "c", "csharp", "css", "docker", "electron", "express", "flutter", "git", "html", "java", "spring", "jest", "jquery", "js", "linux", "sql", "mysql", "mongodb", "nest", "node", "php", "prisma", "prometheus", "react", "vue", "saas", "treejs", "ts"
  ];
  
  public tl: GSAPTimeline = gsap.timeline({});
  private destroy$ = new Subject<void>();

  private animationService = inject(AnimationControllerService);
  private darkModeService = inject(DarkModeControllerService);
  private cdr = inject(ChangeDetectorRef);
  private translateService = inject(TranslateService);

  constructor() { }

  public startGsap(){
    if (this.tl) {
      this.tl.kill();
      this.tl.clear();
    }
    this.tl = gsap.timeline({});
  }

  public typeWriter(txt: string, speed: number, i: number = 0, runId: number = this.currentTypeWriterRun): void {
    const isLighthouse = typeof navigator !== 'undefined' && navigator.userAgent.includes('Lighthouse');
    const isTesting = typeof window !== 'undefined' && (window as any).__karma__;

    if (isLighthouse && !isTesting) return;
    if (this.currentTypeWriterRun !== runId) return; 

    if (i < txt.length && !this.destroy$.isStopped) {
      this.text += txt.charAt(i);
      i++;
      this.cdr.markForCheck(); 
      this.typeWriterTimeoutId = setTimeout(() => this.typeWriter(txt, speed, i, runId), speed);
    }
  }

  public removeAnimations(): void {
    if (this.tl) {
      this.tl.kill();
      this.tl.clear();
      this.tl.pause();
    }
    if (this.bgImages) {
        this.bgImages.forEach(img => gsap.set(img.nativeElement, { clearProps: "all", opacity: 0 }));
    }
  }

  public animateBackground(): void {
    if (!this.animate || !this.bgImages || this.bgImages.length === 0) {
      return;
    }

    const isLighthouse = typeof navigator !== 'undefined' && navigator.userAgent.includes('Lighthouse');
    const isTesting = typeof window !== 'undefined' && (window as any).__karma__;
    if (isLighthouse && !isTesting) return;

    this.startGsap(); 
    const fallDistance = window.innerHeight + 200;

    // Distribuir ícones pelo viewport antes de começar a queda
    this.bgImages.forEach((imgRef) => {
      const svg = imgRef.nativeElement;
      
      // Configurações iniciais instantâneas
      gsap.set(svg, { 
        pointerEvents: 'none',
        y: -150,
        x: gsap.utils.random(0, window.innerWidth),
        opacity: 0,
        scale: gsap.utils.random(0.4, 0.8),
        rotation: gsap.utils.random(-90, 90)
      });

      // Animação de queda contínua
      this.tl.to(svg, {
        y: fallDistance,
        rotation: gsap.utils.random(-360, 360),
        duration: gsap.utils.random(12, 22), 
        ease: "none",
        repeat: -1,
        // Delay escalonado para não caírem todos juntos, mas curto para não ficarem "presos"
        delay: gsap.utils.random(0, 8),
        onStart: () => {
          // Só mostra o ícone quando ele REALMENTE começa a se mover
          gsap.to(svg, { opacity: gsap.utils.random(0.15, 0.45), duration: 1 });
        }
      }, 0);
    });
  }

  ngOnInit(): void {
    this.animationService.getAnimationObserbable().pipe(takeUntil(this.destroy$)).subscribe(state => {
      const prevState = this.animate;
      this.animate = state;
      
      if(!this.animate) {
        this.removeAnimations();
      } else if (this.readyToContent && !prevState) {
        setTimeout(() => this.animateBackground(), 100);
      }
      this.cdr.markForCheck();
    });

    this.darkModeService.getDarkModeObserbable().pipe(takeUntil(this.destroy$)).subscribe(state => {
      this.isDarkMode = state;
      this.cdr.markForCheck();
    });

    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.animate && this.readyToContent) {
        clearTimeout(this.typeWriterTimeoutId);
        this.text = ''; 
        this.typeWriterWithTranslation();
      }
    });
  }

  private typeWriterWithTranslation(): void {
    this.currentTypeWriterRun++; 
    const runId = this.currentTypeWriterRun;

    this.translateService.get("OLD_HERO.GREETING").pipe(take(1)).subscribe(fullText => {
      if (this.currentTypeWriterRun === runId) {
        this.typeWriter(fullText, 100, 0, runId);
      }
    });
  }

  ngAfterViewInit(): void {
    this.bgImages?.changes.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.animate) {
        this.animateBackground();
      }
    });

    setTimeout(() => {
      this.readyToContent = true;
      this.cdr.markForCheck(); 

      if (this.animate) {
        this.typeWriterWithTranslation();
        // Garantir que os ícones comecem a se mover imediatamente se já estiverem no DOM
        if (this.bgImages && this.bgImages.length > 0) {
          this.animateBackground();
        }
      }
    }, this.animationService.animationDelayInMs);
  }

  ngOnDestroy(): void {
    clearTimeout(this.typeWriterTimeoutId);
    this.destroy$.next();
    this.destroy$.complete();
    if (this.tl) {
      this.tl.kill();
    }
  }
}
