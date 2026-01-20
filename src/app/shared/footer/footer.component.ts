import { AfterViewInit, AfterViewChecked, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, HostListener } from '@angular/core';
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

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
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
  
  private resizeTimeout?: any;

  private onResizeZPosition = 11;
  private onResizeYPos = -3;
  
  private mobileZPosition = 20;
  private mobileYPosition = -5;
  
  private defaultZPosition = 13;
  
  private reactPlanet! : ReactPlanet;
  
  //? Subscriptions States
  private animationSub?: Subscription;
  loading: boolean = true;

  public isDarkMode = true;
  public isAnimating = false;

  //? Controle para inicialização do Three.js
  private threeInitialized = false;

  //? OutlinePass
  private composer!: EffectComposer;
  private outlinePass!: OutlinePass;

  //? Tooltip
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private hoveredPlanet: THREE.Mesh | null = null;
  
  tooltipVisible: boolean = false;
  tooltipText: string = ''; tooltipX = 0; tooltipY = 0;

  private reactPlanetPosition : [number, number, number] = [-9, 0, 0];
  private planetList :IPlanet[] = [
    { id: 0, position: [ -3, 0, 0 ], imagePath: "assets/planeta-poemSite.png", label: "Poem Maker", site: "https://server-poem-site-utqk.vercel.app/" },
    // { id: 1, position: [ -4.5, 0, 0 ], imagePath: "assets/planeta-TCC.png", label: "TCC project", site: "_blank"},
    { id: 2, position: [ 3, 0, 0 ], imagePath: "assets/planeta-github.png", label: "GitHub", site:"https://github.com/kkphoenixgx" },
    { id: 3, position: [ 9, 0, 0 ], imagePath: "assets/planeta-linkedIn.png", label: "linkedIn", site: "https://www.linkedin.com/in/kkphoenix/" },
  ]

  constructor(
    private animCtrl: AnimationControllerService,
    private darkModeService :DarkModeControllerService,
    private ngZone: NgZone
  ) { }

  //? ----------- Lifecycle -----------

  ngOnInit(): void {
    this.setupAnimationSubscription();
    this.darkModeService.getDarkModeObserbable().subscribe(state => {
      this.isDarkMode = state;
    });
    setTimeout(() => this.loading = false, this.animCtrl.animationDelayInMs);
  }

  ngAfterViewChecked(): void {
    if(this.isAnimating && this.canvasContainerRef && !this.threeInitialized) {
      this.ngZone.runOutsideAngular(() => {
        this.initThreeJs();
        this.animate();
        this.threeInitialized = true;
      });
    }

    if(!this.isAnimating && this.threeInitialized) {
      cancelAnimationFrame(this.frameId);
      this.frameId = 0;
      this.threeInitialized = false;
      // opcional: limpar renderer, cena etc se quiser
      // this.cleanupThree();
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    this.animationSub?.unsubscribe();
    this.renderer?.dispose();
    this.controls?.dispose();
  }

  //? ----------- Host Listeners -----------

  @HostListener('window:resize', []) 
  onResize(): void {
    clearTimeout(this.resizeTimeout);

    this.resizeTimeout = setTimeout(() => {
      if (!this.camera || !this.renderer) return;
      const container = this.canvasContainerRef?.nativeElement;
      if (!container) return;

      this.camera.aspect = container.clientWidth / container.clientHeight;

      this.handleCameraPosition(container);

      this.camera.updateProjectionMatrix();
      this.renderer.setSize(container.clientWidth, container.clientHeight);
      this.composer.setSize(container.clientWidth, container.clientHeight);
      (this.outlinePass as any).resolution.set(container.clientWidth, container.clientHeight);
    }, 150);
  }

  @HostListener('mousemove', ['$event']) 
  onMouseMove(event: MouseEvent): void {
    if (!this.renderer || !this.camera) return;

    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.checkPlanetIntersection(event);
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

  //? ----------- Main methods -----------

  private initThreeJs(): void {
    const canvas = this.createCanvas();
    this.initRenderer(canvas);
    this.initScene();
    this.initCamera();
    this.addLight();
   
    this.initPostProcessing()
   
    this.addPlanets();
    //! --DEBUG //this.initControls();
  }

  private animate(): void {
    this.frameId = requestAnimationFrame(() => this.animate());
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
      // A animação e inicialização agora é controlada em ngAfterViewChecked
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

        this.tooltipText = planet.userData?.['label'] || '';
        this.tooltipVisible = true;
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

  //? ----------- THREE INIT -----------

  private createCanvas(): HTMLCanvasElement {
    const container = this.canvasContainerRef!.nativeElement;
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '40vh';
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
    //? When canvas is smaller, the planets are not centralized
    if (container.clientWidth < 600) this.camera.position.y = this.onResizeYPos;
    else this.camera.position.y = 0;
    
    //? in mobile, canvas is rectangular
    if (ViewportHelper.isMobile()){
      this.camera.position.z = this.mobileZPosition;
      this.camera.position.y = this.mobileYPosition;
    }
  
    //? When canvas is bigger, is good to close up camera
    else if (container.clientWidth > 1000) 
      this.camera.position.z = this.onResizeZPosition;
    
    else this.camera.position.z = this.defaultZPosition;
  }

  //! DEBUG
  private initControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
  }

}