import {
  Component,
  OnDestroy,
  AfterViewInit,
  ViewChild,
  ElementRef,
  Inject,
  ViewChildren,
  QueryList,
  HostListener,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import * as THREE from 'three';

import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';

interface IAfterThreeJsInitParams{
  state :boolean
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements AfterViewInit, OnDestroy {
  @ViewChild('threeContainer', { static: true }) threeContainer: ElementRef | undefined;
  @ViewChildren('pFadeInY', { read: ElementRef }) centerParagraphs!: QueryList<ElementRef>;
  @ViewChildren('pFadeInX', { read: ElementRef }) fadeInXParagraphs!: QueryList<ElementRef>;
  
  @ViewChild('pPortuguese', { static: true }) pPortuguese: ElementRef | undefined;
  @ViewChild('pEnglish', { static: true }) pEnglish: ElementRef | undefined;
  
  private destroy$ = new Subject<void>();
  private _onWindowResizeRef: any;
  private _isThreeContainerVisible: boolean = false;

  private _renderer!: THREE.WebGLRenderer;
  private _camera!: THREE.PerspectiveCamera;
  private _scene!: THREE.Scene;
  private _particles!: THREE.Points;
  private _gridLines!: THREE.LineSegments;

  public themeColor: number = 0xc7d4e8; // 0xc7d4e8 0x9100a6
  public particlesColor: number = 0xc7d4e8; // 0xc7d4e8 0x9100a6
  private isBrowser: boolean = false;

  public isGreatingsInEnglish: boolean = false;

  public darkMode$ :Observable<boolean>

  constructor(
      @Inject(PLATFORM_ID) private platformId: Object,
      private animationService: AnimationControllerService,
      private darkModeControllerService: DarkModeControllerService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.darkMode$ = darkModeControllerService.getDarkModeObserbable();
  }

  // ----------- Lifecycle -----------

  ngAfterViewInit(): void {
    this.initEvents();   

    this.useWithDarkmodeState( (state :boolean)=>{
      this.togggleThreeJsTheme(state);
    } )
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
        window.removeEventListener('resize', this._onWindowResizeRef);
    }

    if (this.renderer) {
        this.renderer.dispose();
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  afterThreeJsInit(){
   
    
      
  }

  // ----------- Handlers -----------

  public handleChangeGreatings(): void {
    if (!this.isBrowser) return;
  
    this.isGreatingsInEnglish = !this.isGreatingsInEnglish;
    
    setTimeout(()=>{
      this.applyFadeInEffects();
    }, this.animationService.animationDelayInMs)
  }
  
  // ----------- Methods -----------
  
  private initEvents(): void {
    if (this.isBrowser) {
        this.initThreeJS();
        this.onWindowResize();
        if (this.threeContainer) {
          this._isThreeContainerVisible = this.isInView(this.threeContainer.nativeElement);
        }
        this._onWindowResizeRef = this.onWindowResize.bind(this);
        window.addEventListener('resize', this._onWindowResizeRef);
    }

    // ----------- Fade in Event -----------
    this.onScroll();
  }
  
  private applyFadeInEffects(): void {
    if (!this.isBrowser) return;
  
    // ----------- Center Paragraphs -----------
    if (!this.centerParagraphs || this.centerParagraphs.length === 0) {
      console.warn('Nenhum parágrafo foi encontrado em `centerParagraphs`.');
      return;
    }
  
    this.centerParagraphs.forEach((pRef) => {
      const element = pRef.nativeElement;
  
      if (element instanceof HTMLElement) {
        if (this.isInView(element) && !element.classList.contains('fadeInOnScrollY')) {
          element.classList.add('fadeInOnScrollY');
        }
      } else {
        console.warn('Elemento não é um HTMLElement ou está indefinido:', element);
      }
    });
  
    // ----------- FadeInX Paragraphs -----------
  
    if (!this.fadeInXParagraphs || this.fadeInXParagraphs.length === 0) {
      console.warn('Nenhum parágrafo foi encontrado em `fadeInXParagraphs`.');
      return;
    }
  
    this.fadeInXParagraphs.forEach((pRef) => {
      const element = pRef.nativeElement;
  
      if (element instanceof HTMLElement) {
        if (this.isInView(element) && !element.classList.contains('fadeInOnScrollX')) {
          element.classList.add('fadeInOnScrollX');
        }
      } else {
        console.warn('Elemento não é um HTMLElement ou está indefinido:', element);
      }
    });
  }
  
  @HostListener('window:scroll', ['$event'])
  private onScroll(): void {
    if (this.threeContainer && this.isBrowser) {
      this._isThreeContainerVisible = this.isInView(this.threeContainer.nativeElement);
    }
    this.applyFadeInEffects();
  }

  private onWindowResize(): void {
    if (this.threeContainer?.nativeElement && this.renderer && this.camera) {
      const container = this.threeContainer.nativeElement;
      const width = container.offsetWidth || container.clientWidth;
      const height = container.offsetHeight || container.clientHeight;
  
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
  
      this.renderer.setSize(width, height);
    }
  }

  public initThreeJS(): void {
      this.scene = new THREE.Scene();

      const container = this.threeContainer?.nativeElement;

      this.camera = new THREE.PerspectiveCamera(
          75,
          container ? container.clientWidth / container.clientHeight : 1,
          0.1,
          1000
      );

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio || 1);

      if (container) {
          // Configura o container para limitar o canvas
          container.style.overflow = 'hidden';
          container.style.position = 'relative';
          
          // Define o tamanho do canvas para preencher o container sem extrapolar
          this.renderer.setSize(container.clientWidth, container.clientHeight);
          container.appendChild(this.renderer.domElement);
          this.renderer.domElement.style.position = 'absolute';
          this.renderer.domElement.style.top = '0';
          this.renderer.domElement.style.left = '0';
          this.renderer.domElement.style.width = '100%';
          this.renderer.domElement.style.height = '100%';
      }

      // ----------- Particles  -----------
      const particlesCount = 5000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount; i++) {
          positions[i * 3] = (Math.random() - 0.5) * 1000;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 1000;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 1000;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

      const material = new THREE.PointsMaterial({ color: this.themeColor, size: 0.5 });
      this.particles = new THREE.Points(geometry, material);
      this.scene.add(this.particles);

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
      this.gridLines = new THREE.LineSegments(lineGeometry, lineMaterial);
      this.scene.add(this.gridLines);

      this.camera.position.z = 500;

      this.animate();
  }

  public animate(): void {
      if (!this.isBrowser) return; // Não anima no lado do servidor

      requestAnimationFrame(() => this.animate());

      if (this._isThreeContainerVisible) {
          this.particles.rotation.x += 0.002;
          this.particles.rotation.y += 0.002;
          this.gridLines.rotation.z += 0.001;

          this.renderer.render(this.scene, this.camera);
      }
  }

  // ----------- Side methods -----------

  public togggleThreeJsTheme(state :boolean){
    console.log(state);
    
    this.themeColor = state ? 0x000000 : 0xffffff;
    this.changeThemeColor(this.themeColor, state? 0xffffff : 0x9100a6)

  }

  public changeThemeColor(backgroundColor :number, particlesColor :number): void {

    if (this.particles.material instanceof THREE.PointsMaterial) {
        this.particles.material.color.setHex(particlesColor);
    }
    if (this.gridLines.material instanceof THREE.LineBasicMaterial) {
        this.gridLines.material.color.setHex(particlesColor);
    }

    // Alterar a cor do fundo da cena
    this.scene.background = new THREE.Color(backgroundColor);
}


  private isInView(el: HTMLElement): boolean {
    if (!this.isBrowser) return false;
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // Se for dispositivo móvel (ex.: largura menor que 768px)
    if (window.innerWidth < 768) {
      return rect.top < viewportHeight * 1.5;
    } else {
      return rect.top < viewportHeight;
    }
  }

  // ----------- Getters and Setters -----------

  public getAnimationObserbable() :Observable<boolean>{
    return this.animationService.getAnimationObserbable().pipe(take(1));
  }
  public useWithAnimationState(callback :(state :boolean)=>{}){
    this.getAnimationObserbable().pipe(takeUntil(this.destroy$))
      .subscribe(state=>{
        callback(state);
      });
  }

  public getDarkMode() :Observable<boolean>{
    return this.darkModeControllerService.getDarkModeObserbable();
  }
  public useWithDarkmodeState(callback :(state :boolean)=>void){
    this.getDarkMode().pipe(takeUntil(this.destroy$))
      .subscribe(state=>{
        callback(state);
      });
  }

  public get camera(): THREE.PerspectiveCamera {
    return this._camera;
  }
  public set camera(value: THREE.PerspectiveCamera) {
    this._camera = value;
  }

  public get renderer(): THREE.WebGLRenderer {
    return this._renderer;
  }
  public set renderer(value: THREE.WebGLRenderer) {
    this._renderer = value;
  }
  
  public get gridLines(): THREE.LineSegments {
    return this._gridLines;
  }
  public set gridLines(value: THREE.LineSegments) {
    this._gridLines = value;
  }
  
  public get particles(): THREE.Points {
    return this._particles;
  }
  public set particles(value: THREE.Points) {
    this._particles = value;
  }
  public get scene(): THREE.Scene {
    return this._scene;
  }
  public set scene(value: THREE.Scene) {
    this._scene = value;
  }  

}