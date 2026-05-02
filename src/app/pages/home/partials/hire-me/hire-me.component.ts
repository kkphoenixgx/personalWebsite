import { Component, inject, ViewChild, ElementRef, AfterViewInit, OnDestroy, NgZone, PLATFORM_ID } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service'; 
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import * as THREE from 'three';

@Component({
  selector: 'app-hire-me',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './hire-me.component.html',
  styleUrl: './hire-me.component.scss'
})
export class HireMeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('hireMeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private darkModeService = inject(DarkModeControllerService);
  private animationService = inject(AnimationControllerService);
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  public darkMode$: Observable<boolean> = this.darkModeService.getDarkModeObserbable();
  public isAnimated$: Observable<boolean> = this.animationService.getAnimationObserbable();

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private fluidPlane!: THREE.Mesh;
  
  private ambientLight!: THREE.AmbientLight;
  private hemiLight!: THREE.HemisphereLight;
  private dirLight!: THREE.DirectionalLight;
  private accentLight!: THREE.PointLight;
  
  private clock = new THREE.Clock();
  private animationFrameId: number = 0;
  private resizeObserver!: ResizeObserver;
  
  private isBrowser = false;
  private destroy$ = new Subject<void>();
  private threeInitialized = false;
  private currentIsDarkMode = false;

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;
    
    this.darkMode$.pipe(takeUntil(this.destroy$)).subscribe(isDark => {
      this.currentIsDarkMode = isDark;
      this.updateTheme(isDark);
    });

    this.initThreeJs();
    this.updateTheme(this.currentIsDarkMode);
    
    // Dá a partida no motor de animação independentemente da emissão inicial do RxJS.
    // Se o serviço estiver em silêncio (aguardando mudança de estado), isso garante a renderização inicial.
    if (this.isBrowser && this.threeInitialized && !this.animationFrameId) {
      this.ngZone.runOutsideAngular(() => {
        this.animate();
      });
    }

    this.isAnimated$.pipe(takeUntil(this.destroy$)).subscribe(animate => {
      if (!animate) {
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
          this.animationFrameId = 0;
        }
      } else if (animate && this.isBrowser && this.threeInitialized) {
        if (!this.animationFrameId) {
          this.ngZone.runOutsideAngular(() => {
            this.animate();
          });
        }
      }
    });
  }

  private initThreeJs() {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement;
    if (!container) return;

    // O recuo de 1px previne o engine WebGL de crashar os rects de viewport
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 50;

    const planeGeo = new THREE.PlaneGeometry(300, 300, 35, 35);
    const planeMat = new THREE.MeshStandardMaterial({
      color: 0x334455,
      metalness: 0.9,
      roughness: 0.3,
      side: THREE.DoubleSide
    });
    
    this.fluidPlane = new THREE.Mesh(planeGeo, planeMat);
    this.fluidPlane.rotation.x = -Math.PI / 2.5;
    this.fluidPlane.position.y = -30;
    this.scene.add(this.fluidPlane);

    this.ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    this.dirLight.position.set(0, 50, 20);
    this.scene.add(this.dirLight);

    this.accentLight = new THREE.PointLight(0x00f2ff, 1500, 400);
    this.accentLight.position.set(50, 40, 20);
    this.scene.add(this.accentLight);

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth > 0 && newHeight > 0) {
          this.camera.aspect = newWidth / newHeight;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(newWidth, newHeight);
        }
      }
    });
    this.resizeObserver.observe(container);

    this.threeInitialized = true;
  }

  private updateTheme(isDark: boolean) {
    if (!this.fluidPlane || !this.ambientLight || !this.accentLight) return;
    const mat = this.fluidPlane.material as THREE.MeshStandardMaterial;
    
    if (isDark) {
      mat.color.setHex(0x1a202c);
      this.ambientLight.intensity = 0.8;
      this.accentLight.color.setHex(0x00f2ff);
    } else {
      mat.color.setHex(0xa0aec0);
      this.ambientLight.intensity = 1.5;
      this.accentLight.color.setHex(0x0066ff);
    }
  }

  private animate = () => {
    if (!this.isBrowser || !this.renderer || !this.scene || !this.camera) return;
    
    this.animationFrameId = requestAnimationFrame(this.animate);

    const canvas = this.renderer.domElement;
    if (canvas.clientWidth === 0 || canvas.clientHeight === 0) return;

    const elapsedTime = this.clock.getElapsedTime();

    if (this.fluidPlane) {
      const pos = this.fluidPlane.geometry.attributes['position'] as THREE.BufferAttribute;
      const array = pos.array;
      for (let i = 0; i < pos.count; i++) {
        const x = array[i * 3];
        const y = array[i * 3 + 1];
        
        const z = Math.sin(x * 0.05 + elapsedTime * 0.5) * 5 +
                  Math.cos(y * 0.05 + elapsedTime * 0.5) * 5 +
                  Math.sin((x + y) * 0.02 + elapsedTime * 0.3) * 8;
        
        array[i * 3 + 2] = z;
      }
      pos.needsUpdate = true;
      this.fluidPlane.geometry.computeVertexNormals();
    }

    this.renderer.render(this.scene, this.camera);
  };

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.isBrowser) {
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      }
      
      if (this.fluidPlane) {
        this.fluidPlane.geometry.dispose();
        (this.fluidPlane.material as THREE.Material).dispose();
      }
      if (this.renderer) {
        this.renderer.dispose();
      }
    }
  }
}
