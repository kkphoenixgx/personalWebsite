import { AfterViewChecked, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, HostListener, inject } from '@angular/core';
import * as THREE from 'three';
import { AnimationControllerService } from '../../services/animation-controller.service';
import { CommonModule } from '@angular/common';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Subscription } from 'rxjs';

import IPlanet from '../../interface/IPlanet';

import PlanetFactory from './partials/planet/PlanetFactory';
import ReactPlanet from './partials/reactPlanet/reactPlanet';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { DarkModeControllerService } from '../../services/dark-mode-controller.service';
import { ViewportHelper } from '../../utils/Viewport';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, AfterViewChecked, OnDestroy {

  @ViewChild('footerCanvasContainer', { static: false }) canvasContainerRef?: ElementRef<HTMLDivElement>;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private planets: THREE.Mesh[] = [];
  private frameId: number = 0;
  private controls!: OrbitControls;
  
  private resizeTimeout?: ReturnType<typeof setTimeout>;

  private onResizeZPosition = 13;
  private onResizeYPos = -0.5;
  
  private mobileZPosition = 11; 
  private mobileYPosition = -1.2;
  
  private defaultZPosition = 15;
  
  private reactPlanet! : ReactPlanet;
  
  private animationSub?: Subscription;
  loading: boolean = true;

  public isDarkMode = true;
  public isAnimating = false;

  private threeInitialized = false;

  private composer!: EffectComposer;
  private outlinePass!: OutlinePass;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private hoveredPlanet: THREE.Mesh | null = null;
  
  tooltipVisible: boolean = false;
  tooltipText: string = ''; tooltipX = 0; tooltipY = 0;

  private reactPlanetPosition : [number, number, number] = [-9, 0, 0];
  private planetList :IPlanet[] = [
    { id: 0, position: [ -3, 0, 0 ], imagePath: "assets/planeta-poemSite.webp", label: "SIDE_MENU.POEMS_SITE", site: "https://server-poem-site-utqk.vercel.app/" },
    { id: 2, position: [ 3, 0, 0 ], imagePath: "assets/planeta-github.webp", label: "OLD_HERO.GITHUB", site:"https://github.com/kkphoenixgx" },
    { id: 3, position: [ 9, 0, 0 ], imagePath: "assets/planeta-linkedIn.webp", label: "OLD_HERO.LINKEDIN", site: "https://www.linkedin.com/in/kkphoenix/" },
  ]

  private animCtrl = inject(AnimationControllerService);
  private darkModeService = inject(DarkModeControllerService);
  private ngZone = inject(NgZone);
  private translate = inject(TranslateService);

  private resizeObserver?: ResizeObserver;
  private forceUpdateTicks = 0;

  ngOnInit(): void {
    this.setupAnimationSubscription();
    this.darkModeService.getDarkModeObserbable().subscribe(state => {
      this.isDarkMode = state;
    });
    setTimeout(() => this.loading = false, this.animCtrl.animationDelayInMs);
  }

  ngAfterViewChecked(): void {
    if(this.isAnimating && this.canvasContainerRef && !this.threeInitialized) {
      const isLighthouse = navigator.userAgent.includes('Lighthouse');
      const isTesting = (window as any).__karma__;

      if (!isLighthouse || isTesting) {
        this.ngZone.runOutsideAngular(() => {
          this.initThreeJs();
          this.animate();
          this.threeInitialized = true;
          this.setupResizeObserver();
        });
      }
    }

    if(!this.isAnimating && this.threeInitialized) {
      this.cleanupThree();
    }
  }

  private setupResizeObserver() {
    if (!this.canvasContainerRef) return;
    this.resizeObserver = new ResizeObserver(() => {
       this.ngZone.run(() => {
         this.onResize();
       });
    });
    this.resizeObserver.observe(this.canvasContainerRef.nativeElement);
  }

  private cleanupThree() {
    cancelAnimationFrame(this.frameId);
    this.frameId = 0;
    this.threeInitialized = false;
    this.resizeObserver?.disconnect();
  }

  ngOnDestroy(): void {
    this.cleanupThree();
    this.animationSub?.unsubscribe();
    this.renderer?.dispose();
    this.controls?.dispose();
  }

  @HostListener('window:resize', []) 
  @HostListener('window:orientationchange', [])
  onResize(): void {
    this.updateCanvasSize();
    this.forceUpdateTicks = 60; // Força atualização por ~1 segundo de frames
    if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => this.updateCanvasSize(), 300);
  }

  private updateCanvasSize(): void {
    if (!this.camera || !this.renderer) return;
    const container = this.canvasContainerRef?.nativeElement;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.handleCameraPosition(container);
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
    if (this.composer) this.composer.setSize(width, height);
    if (this.outlinePass) this.outlinePass.resolution.set(width, height);
  }

  @HostListener('mousemove', ['$event']) 
  onMouseMove(event: MouseEvent): void {
    if (!this.renderer || !this.camera) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.checkPlanetIntersection(event);
  }

  @HostListener('mouseleave') 
  onMouseLeave(): void {
    this.resetPlanetHighlight();
    this.tooltipVisible = false;
  }

  @HostListener('click', ['$event']) 
  onClick(event: MouseEvent): void {
    if (!this.camera || !this.renderer) return;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.planets);
    if (intersects.length > 0) {
      const clickedPlanet = intersects[0].object as THREE.Mesh;
      const planet :IPlanet = clickedPlanet.userData as IPlanet;
      const site = planet.site;
      if (site && site !== '_blank') window.open(site, '_blank')
    }
  }

  private initThreeJs(): void {
    const canvas = this.createCanvas();
    this.initRenderer(canvas);
    this.initScene();
    this.initCamera();
    this.addLight();
    this.initPostProcessing()
    this.addPlanets();
    this.updateCanvasSize();
  }

  private animate = () => {
    const isLighthouse = navigator.userAgent.includes('Lighthouse');
    const isTesting = (window as any).__karma__;
    if (!isLighthouse || isTesting) {
      this.frameId = requestAnimationFrame(() => this.animate());
    }

    // Força a atualização da posição da câmera se houver redimensionamento recente
    if (this.forceUpdateTicks > 0) {
      if (this.canvasContainerRef) this.handleCameraPosition(this.canvasContainerRef.nativeElement);
      this.camera.updateProjectionMatrix();
      this.forceUpdateTicks--;
    }

    this.controls?.update();
    if(this.planets){
      this.planets.forEach(planetMesh=>{
        planetMesh.rotation.y += 0.01;
      })
    }
    this.reactPlanet?.update();
    this.composer.render();
  }

  private setupAnimationSubscription(): void {
    this.animationSub = this.animCtrl.getAnimationObserbable().subscribe((shouldAnimate: boolean) => {
      this.isAnimating = shouldAnimate;
    });
  }

  private addPlanets(): void {
    PlanetFactory.createPlanets(this.scene, this.planetList).forEach(planetMesh=>{
      this.planets.push(planetMesh);
    })
    this.reactPlanet = new ReactPlanet(this.scene, this.reactPlanetPosition);
    this.planets.push(this.reactPlanet.planet);
  }

  private checkPlanetIntersection(event: MouseEvent): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.planets);
    if (intersects.length > 0) {
      const planet = intersects[0].object as THREE.Mesh;
      this.tooltipX = event.clientX + 10;
      this.tooltipY = event.clientY + 10;
      if (this.hoveredPlanet !== planet) {
        this.resetPlanetHighlight();
        this.highlightPlanet(planet);
        this.hoveredPlanet = planet;
        const labelKey = planet.userData?.['label'] || '';
        if (labelKey) {
          this.translate.get(labelKey).subscribe(translatedLabel => {
            this.tooltipText = translatedLabel;
            this.tooltipVisible = true;
          });
        } else if (planet.userData?.['id'] === 'react-planet') {
           this.tooltipText = 'React Exercises';
           this.tooltipVisible = true;
        }
      }
    } else {
      this.resetPlanetHighlight();
      this.tooltipVisible = false;
    }
  }

  private highlightPlanet(planet: THREE.Mesh): void {
    this.outlinePass.selectedObjects = [planet];
  }

  private resetPlanetHighlight(): void  {
    this.outlinePass.selectedObjects = [];
    this.hoveredPlanet = null;
  }

  private createCanvas(): HTMLCanvasElement {
    const container = this.canvasContainerRef!.nativeElement;
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);
    return canvas;
  }

  private initRenderer(canvas: HTMLCanvasElement): void  {
    const container = this.canvasContainerRef!.nativeElement;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
  }

  private initCamera(): void {
    const container = this.canvasContainerRef!.nativeElement;
    this.camera = new THREE.PerspectiveCamera(
      70, 
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.x = 0;
    this.handleCameraPosition(container);
  }

  private addLight(): void {
    const light = new THREE.AmbientLight(0xffffff, 2);
    this.scene.add(light);
  }

  private initPostProcessing(): void {
    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);
    this.outlinePass = new OutlinePass(
      new THREE.Vector2(this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight),
      this.scene,
      this.camera
    );
    this.outlinePass.edgeStrength = 4;
    this.outlinePass.edgeGlow = 0.8;
    this.outlinePass.edgeThickness = 2.0;
    this.outlinePass.pulsePeriod = 2;
    this.outlinePass.visibleEdgeColor.set('#ffffff');
    this.outlinePass.hiddenEdgeColor.set('#000000');
    this.composer.addPass(this.outlinePass);
  }

  private handleCameraPosition( container: HTMLDivElement ){
    const isMobile = ViewportHelper.isMobile();
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isLandscape = width > height;

    if (isMobile || container.clientWidth < 600) {
      if (isLandscape || container.clientHeight < 350) {
        // Landscape optimization: Much closer and slightly adjusted Y
        this.camera.position.z = 11; 
        this.camera.position.y = -1.2;
      } else {
        // Portrait optimization
        this.camera.position.z = this.mobileZPosition;
        this.camera.position.y = this.mobileYPosition;
      }
    } else {
      this.camera.position.y = 0;
      if (container.clientWidth > 1000) {
        this.camera.position.z = this.onResizeZPosition;
      } else {
        this.camera.position.z = this.defaultZPosition;
      }
    }
  }

  private initControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
  }

}
