import {
  Component,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Inject,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import * as THREE from 'three';

import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mainContainer', { static: true }) mainContainer: ElementRef | undefined;
  @ViewChild('threeContainer', { static: true }) threeContainer: ElementRef | undefined;
  @ViewChild('contentContainer', { static: true }) contentContainer: ElementRef | undefined;

  @ViewChildren('pFadeInY', { read: ElementRef }) centerParagraphs!: QueryList<ElementRef>;
  @ViewChildren('pFadeInX', { read: ElementRef }) fadeInXParagraphs!: QueryList<ElementRef>;

  @ViewChild('pPortuguese', { static: true }) pPortuguese: ElementRef | undefined;
  @ViewChild('pEnglish', { static: true }) pEnglish: ElementRef | undefined;

  private destroy$ = new Subject<void>();
  private resizeObserver: ResizeObserver | undefined;
  private intersectionObserver: IntersectionObserver | undefined;
  private _isThreeContainerVisible: boolean = false;

  private _renderer!: THREE.WebGLRenderer;
  private _camera!: THREE.PerspectiveCamera;
  private _scene!: THREE.Scene;
  private _particles!: THREE.Points;
  private _gridLines!: THREE.LineSegments;

  public themeColor: number = 0xc7d4e8;
  public particlesColor: number = 0xc7d4e8;
  private isBrowser: boolean = false;

  public isGreatingsInEnglish: boolean = false;
  public darkMode$: Observable<boolean>;
  public animate$: Observable<boolean>;

  private animationFrameId: number | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private animationService: AnimationControllerService,
    private darkModeControllerService: DarkModeControllerService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.darkMode$ = darkModeControllerService.getDarkModeObserbable();
    this.animate$ = animationService.getAnimationObserbable();
  }

  ngAfterViewInit(): void {
    this.initIntersectionObserver();

    // Observa mudanças do animationService
    this.animate$.pipe(takeUntil(this.destroy$)).subscribe((shouldAnimate) => {
      if (shouldAnimate) {
        this.startAnimation();
      } else {
        this.stopAnimation();
      }
    });

    requestAnimationFrame(() => {
      setTimeout(() => {
        this.initThreeJS();
      }, 500);
    });

    if (this.isBrowser && this.contentContainer?.nativeElement) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateCanvasSize();
      });
      this.resizeObserver.observe(this.contentContainer.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.stopAnimation();
    if (this._renderer) this._renderer.dispose();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.intersectionObserver) this.intersectionObserver.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private startAnimation(): void {
    if (this.animationFrameId === null) {
      this.animateLoop();
    }
  }

  private stopAnimation(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private animateLoop(): void {
    this.animationFrameId = requestAnimationFrame(() => this.animateLoop());

    if (this._isThreeContainerVisible && this._particles) {
      this._particles.rotation.x += 0.002;
      this._particles.rotation.y += 0.002;
      this._gridLines.rotation.z += 0.001;
      this._renderer.render(this._scene, this._camera);
    }
  }

  afterThreeJsInit() {
    this.useWithDarkmodeState((state: boolean) => {
      this.togggleThreeJsTheme(state);
    });
  }

  public handleChangeGreatings(): void {
    if (!this.isBrowser) return;
    this.isGreatingsInEnglish = !this.isGreatingsInEnglish;
  }

  private initIntersectionObserver(): void {
    if (!this.isBrowser) return;

    const options = { threshold: 0.1 };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const target = entry.target as HTMLElement;

        // Controle de visibilidade do ThreeJS (Performance)
        if (target === this.threeContainer?.nativeElement) {
          this._isThreeContainerVisible = entry.isIntersecting;
          return;
        }

        // Animação de fade-in dos parágrafos
        if (entry.isIntersecting) {
          const isCenter = this.centerParagraphs?.some((p) => p.nativeElement === target);
          target.classList.add(isCenter ? 'fadeInOnScrollY' : 'fadeInOnScrollX');
          this.intersectionObserver?.unobserve(target); // Para de observar após animar (mais leve)
        }
      });
    }, options);

    if (this.threeContainer) this.intersectionObserver.observe(this.threeContainer.nativeElement);
    this.observeParagraphs();

    // Re-observa quando a lista de elementos mudar (ex: troca de idioma)
    this.centerParagraphs.changes.pipe(takeUntil(this.destroy$)).subscribe(() => this.observeParagraphs());
    this.fadeInXParagraphs.changes.pipe(takeUntil(this.destroy$)).subscribe(() => this.observeParagraphs());
  }

  private observeParagraphs(): void {
    this.centerParagraphs?.forEach((p) => this.intersectionObserver?.observe(p.nativeElement));
    this.fadeInXParagraphs?.forEach((p) => this.intersectionObserver?.observe(p.nativeElement));
  }

  public initThreeJS(): void {
    const threeContainer = this.threeContainer?.nativeElement;
    const contentContainer = this.contentContainer?.nativeElement;
    if (!threeContainer) throw new Error('Three Container do not exists!!');

    threeContainer.style.overflow = 'hidden';

    this._scene = new THREE.Scene();
    const aspect = threeContainer.clientWidth / threeContainer.clientHeight;
    this._camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

    this._renderer = new THREE.WebGLRenderer({ antialias: true });
    this._renderer.setPixelRatio(window.devicePixelRatio || 1);
    this._renderer.setSize(threeContainer.clientWidth, contentContainer.scrollHeight);
    threeContainer.appendChild(this._renderer.domElement);

    this._renderer.domElement.style.position = 'absolute';
    this._renderer.domElement.style.top = '0';
    this._renderer.domElement.style.left = '0';
    this._renderer.domElement.style.width = '100%';
    this._renderer.domElement.style.height = '100%';

    this.initParticles();
    setTimeout(() => this.afterThreeJsInit(), 500);
  }

  public initParticles(): void {
    const particlesCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({ color: this.themeColor, size: 0.5 });
    this._particles = new THREE.Points(geometry, material);
    this._scene.add(this._particles);

    const lineMaterial = new THREE.LineBasicMaterial({
      color: this.themeColor,
      opacity: 0.2,
      transparent: true,
    });

    const lineGeometry = new THREE.BufferGeometry();
    const vertices: number[] = [];

    for (let i = -500; i < 500; i += 50) {
      vertices.push(i, -500, 0, i, 500, 0);
      vertices.push(-500, i, 0, 500, i, 0);
    }

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));
    this._gridLines = new THREE.LineSegments(lineGeometry, lineMaterial);
    this._scene.add(this._gridLines);

    this._camera.position.z = 500;
  }

  private updateCanvasSize(): void {
    if (this.mainContainer?.nativeElement && this.contentContainer?.nativeElement) {
      const contentContainer = this.contentContainer.nativeElement;
      const height = contentContainer.scrollHeight;

      // Define a altura do container principal para acomodar todo o texto
      this.mainContainer.nativeElement.style.height = `${height}px`;

      if (!this.threeContainer?.nativeElement || !this._renderer || !this._camera) return;
      const container = this.threeContainer.nativeElement;
      const width = container.offsetWidth || container.clientWidth;

      this._camera.aspect = width / height;
      this._camera.updateProjectionMatrix();

      this._renderer.setSize(width, height);
    }
  }

  public togggleThreeJsTheme(state: boolean): void {
    this.themeColor = state ? 0x000000 : 0xffffff;
    this.changeThemeColor(this.themeColor, state ? 0xffffff : 0x9100a6);
  }

  public changeThemeColor(backgroundColor: number, particlesColor: number): void {
    if (this._particles.material instanceof THREE.PointsMaterial) {
      this._particles.material.color.setHex(particlesColor);
    }
    if (this._gridLines.material instanceof THREE.LineBasicMaterial) {
      this._gridLines.material.color.setHex(particlesColor);
    }
    this._scene.background = new THREE.Color(backgroundColor);
  }

  // Helpers com observable
  public useWithDarkmodeState(callback: (state: boolean) => void): void {
    this.darkModeControllerService.getDarkModeObserbable().pipe(takeUntil(this.destroy$)).subscribe(callback);
  }
}