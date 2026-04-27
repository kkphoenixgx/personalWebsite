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
  private animationFrameId!: number;
  
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

    // Pequeno delay para garantir que o contêiner tenha dimensões
    setTimeout(() => {
        this.initThreeJs();
        this.updateTheme(this.currentIsDarkMode);
    }, 100);
    
    this.isAnimated$.pipe(takeUntil(this.destroy$)).subscribe(animate => {
      if (!animate && this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      } else if (animate && this.isBrowser && this.threeInitialized) {
        this.animate();
      }
    });

    this.ngZone.runOutsideAngular(() => {
      this.animate();
    });
  }

  private initThreeJs() {
    const canvas = this.canvasRef.nativeElement;
    const container = canvas.parentElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 50;

    const planeGeo = new THREE.PlaneGeometry(300, 300, 100, 100);
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

    window.addEventListener('resize', this.onResize);
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

    const elapsedTime = this.clock.getElapsedTime();

    if (this.fluidPlane) {
      const pos = this.fluidPlane.geometry.attributes['position'] as THREE.BufferAttribute;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        
        const z = Math.sin(x * 0.05 + elapsedTime * 0.5) * 5 +
                  Math.cos(y * 0.05 + elapsedTime * 0.5) * 5 +
                  Math.sin((x + y) * 0.02 + elapsedTime * 0.3) * 8;
        
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;
      this.fluidPlane.geometry.computeVertexNormals();
    }

    this.renderer.render(this.scene, this.camera);
  };

  private onResize = () => {
    if (!this.canvasRef) return;
    const container = this.canvasRef.nativeElement.parentElement;
    if (container && this.camera && this.renderer) {
      const width = container.clientWidth;
      const height = container.clientHeight;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    }
  };

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.isBrowser) {
      cancelAnimationFrame(this.animationFrameId);
      window.removeEventListener('resize', this.onResize);
      
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
