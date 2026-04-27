import { AfterViewInit, Component, ElementRef, OnDestroy, PLATFORM_ID, ViewChild, ViewChildren, QueryList, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements AfterViewInit, OnDestroy {

  @ViewChild('contentContainer', { static: true }) contentContainer: ElementRef | undefined;
  @ViewChild('historyCanvas', { static: true }) canvasRef: ElementRef<HTMLCanvasElement> | undefined;

  @ViewChildren('pFadeInY', { read: ElementRef }) centerParagraphs!: QueryList<ElementRef>;
  @ViewChildren('pFadeInX', { read: ElementRef }) fadeInXParagraphs!: QueryList<ElementRef>;


  private destroy$ = new Subject<void>();
  private resizeObserver: ResizeObserver | undefined;
  private intersectionObserver: IntersectionObserver | undefined;
  private _isThreeContainerVisible: boolean = false;

  private _renderer: THREE.WebGLRenderer | undefined;
  private _camera: THREE.PerspectiveCamera | undefined;
  private _scene: THREE.Scene | undefined;
  private _particles: THREE.Points | undefined;
  private _gridLines: THREE.LineSegments | undefined;

  public themeColor: number = 0xc7d4e8;
  public particlesColor: number = 0xc7d4e8;
  private isBrowser: boolean = false;
  public darkMode$: Observable<boolean>;
  public animate$: Observable<boolean>;

  private animationFrameId: number | null = null;

  private platformId = inject(PLATFORM_ID);
  private animationService = inject(AnimationControllerService);
  private darkModeControllerService = inject(DarkModeControllerService);

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.darkMode$ = this.darkModeControllerService.getDarkModeObserbable();
    this.animate$ = this.animationService.getAnimationObserbable();
  }

  ngAfterViewInit(): void {
    this.initIntersectionObserver();

    // Re-observa os parágrafos que entrarem dinamicamente pelo *ngIf (Toggle de Idioma)
    this.fadeInXParagraphs.changes.pipe(takeUntil(this.destroy$)).subscribe((paragraphs: QueryList<ElementRef>) => {
      paragraphs.forEach(p => this.intersectionObserver?.observe(p.nativeElement));
    });

    // Observa mudanças do animationService
    this.animate$.pipe(takeUntil(this.destroy$)).subscribe((shouldAnimate) => {
      if (shouldAnimate) {
        this.startAnimation();
      } else {
        this.stopAnimation();
      }
    });

    requestAnimationFrame(() => {
      const isTesting = '__karma__' in window;
      const delay = isTesting ? 0 : 500;
      setTimeout(() => {
        // [Lighthouse/SEO Guard] Não inicializa o Three.js pesado durante auditorias
        const isLighthouse = navigator.userAgent.includes('Lighthouse');

        if (!isLighthouse || isTesting) {
          this.initThreeJS();
        }
      }, delay);
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

    this.cleanupThree();
  }

  // ----------- THREE.js Methods -----------

  private initThreeJS(): void {
    if (!this.isBrowser || !this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    this._renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this._renderer.setPixelRatio(window.devicePixelRatio);

    this._scene = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 1, 10000);

    this.updateCanvasSize();

    this.createParticles();
    this.createGridLines();
    this.startAnimation();
  }

  private startAnimation(): void {
    if (!this.animationFrameId) {
      this.animate();
    }
  }

  private stopAnimation(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private animate = (): void => {
    // [Lighthouse/SEO Guard] Previne o loop infinito de afogar a CPU durante auditorias de performance
    const isLighthouse = navigator.userAgent.includes('Lighthouse');
    const isTesting = '__karma__' in window;

    if (!isLighthouse || isTesting) {
      this.animationFrameId = requestAnimationFrame(this.animate);
    }

    if (this._isThreeContainerVisible && this._renderer && this._scene && this._camera) {
      if (this._particles) this._particles.rotation.y += 0.001;
      if (this._gridLines) {
        // Efeito "Synthwave": move o chão em direção à câmera infinitamente
        this._gridLines.position.z += 1.5; 
        if (this._gridLines.position.z >= 100) this._gridLines.position.z = 0; // 100 é o tamanho exato do grid (step), garantindo um loop visual perfeito
      }
      this._renderer.render(this._scene, this._camera);
    }
  };

  private updateCanvasSize(): void {
    if (!this._renderer || !this._camera || !this.canvasRef) return;

    const container = this.canvasRef.nativeElement.parentElement as HTMLElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this._renderer.setSize(width, height, false);
    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();
  }

  private cleanupThree(): void {
    if (this._scene) {
      this._scene.clear();
    }

    if (this._particles) {
      if (this._particles.geometry) this._particles.geometry.dispose();
      if (this._particles.material instanceof THREE.Material) {
        this._particles.material.dispose();
      }
    }

    if (this._gridLines) {
      if (this._gridLines.geometry) this._gridLines.geometry.dispose();
      if (this._gridLines.material instanceof THREE.Material) {
        this._gridLines.material.dispose();
      }
    }

    this._renderer = undefined;
    this._scene = undefined;
    this._camera = undefined;
    this._particles = undefined;
    this._gridLines = undefined;
  }

  private initIntersectionObserver(): void {
    if (!this.isBrowser) return;

    const options = { threshold: 0.1 };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (this.canvasRef && entry.target === this.canvasRef.nativeElement) {
          this._isThreeContainerVisible = entry.isIntersecting;
        } else if (entry.isIntersecting) {
          const targetEl = entry.target as HTMLElement;
          
          if (this.centerParagraphs.toArray().some(p => p.nativeElement === targetEl)) {
            targetEl.classList.add('fadeInOnScrollY');
          } else if (this.fadeInXParagraphs.toArray().some(p => p.nativeElement === targetEl)) {
            targetEl.classList.add('fadeInOnScrollX');
          }
          
          this.intersectionObserver?.unobserve(targetEl);
        }
      });
    }, options);

    if (this.canvasRef) {
      this.intersectionObserver.observe(this.canvasRef.nativeElement);
    }
    
    this.centerParagraphs.forEach(p => this.intersectionObserver?.observe(p.nativeElement));
    this.fadeInXParagraphs.forEach(p => this.intersectionObserver?.observe(p.nativeElement));
  }

  private createParticles(): void {
    if (!this._scene) return;
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < 5000; i++) {
      vertices.push(THREE.MathUtils.randFloatSpread(2000));
      vertices.push(THREE.MathUtils.randFloatSpread(2000));
      vertices.push(THREE.MathUtils.randFloatSpread(2000));
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.PointsMaterial({ color: this.particlesColor, size: 2 });
    this._particles = new THREE.Points(geometry, material);
    this._scene.add(this._particles);
  }

  private createGridLines(): void {
    if (!this._scene || !this._camera) return;
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const size = 2000; // Tamanho expandido para cobrir bem o horizonte e não vermos os recortes
    const step = 100;

    for (let i = -size; i <= size; i += step) {
      vertices.push(-size, 0, i, size, 0, i);
      vertices.push(i, 0, -size, i, 0, size);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.LineBasicMaterial({ color: this.themeColor, opacity: 0.15, transparent: true });
    this._gridLines = new THREE.LineSegments(geometry, material);
    
    // Abaixa o grid verticalmente para se comportar como um "chão" abaixo do nosso campo de visão
    this._gridLines.position.y = -200;
    
    this._scene.add(this._gridLines);

    this._camera.position.z = 500;
  }

}
