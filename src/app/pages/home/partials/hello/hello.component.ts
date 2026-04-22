import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, PLATFORM_ID, Inject, NgZone, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import * as THREE from 'three';
import gsap from 'gsap';

import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';

@Component({
  selector: 'app-hello',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hello.component.html',
  styleUrl: './hello.component.scss'
})
export class HelloComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef<HTMLDivElement>;
  
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private bgParticles!: THREE.Points;
  private bgNebulas!: THREE.Points;
  private hexLattice!: THREE.Group;
  private dbSymbol!: THREE.Group;
  private cyberCat!: THREE.Group;
  private cleanArchSymbol!: THREE.Group;
  private aiNode!: THREE.Group;
  private gitTree!: THREE.Group;
  private obsidianGraph!: THREE.Group;
  private animationFrameId!: number;
  private clock: THREE.Clock = new THREE.Clock();
  private isBrowser: boolean;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  public isDarkMode: boolean = true;
  public isAnimated: boolean = true;
  private catMatSolid!: THREE.MeshBasicMaterial;
  private catMatWire!: THREE.MeshBasicMaterial;
  private catMatPoints!: THREE.PointsMaterial;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object, 
    private ngZone: NgZone,
    private animationService: AnimationControllerService,
    private darkModeService: DarkModeControllerService,
    private cdr: ChangeDetectorRef
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.animationService.getAnimationObserbable().subscribe(state => {
        this.isAnimated = state;
        this.updateAnimationState();
        this.cdr.markForCheck();
      });

      this.darkModeService.getDarkModeObserbable().subscribe(state => {
        this.isDarkMode = state;
        this.updateTheme();
        this.cdr.markForCheck();
      });
    }
  }

  private updateAnimationState() {
    if (!this.isBrowser) return;
    if (this.isAnimated) {
      if (this.canvasContainer && this.canvasContainer.nativeElement) {
        this.canvasContainer.nativeElement.style.visibility = 'visible';
      }
      this.ngZone.runOutsideAngular(() => {
        if (!this.animationFrameId && this.scene) {
           this.animateLoop();
        }
      });
    } else {
      if (this.canvasContainer && this.canvasContainer.nativeElement) {
        this.canvasContainer.nativeElement.style.visibility = 'hidden';
      }
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = 0;
      }
    }
  }

  private updateTheme() {
    if (this.catMatSolid) {
      // Um tom prata claro no Light Mode para o corpo manter presença
      this.catMatSolid.color.setHex(this.isDarkMode ? 0x050810 : 0xe2e8f0);
    }
    if (this.catMatWire) {
      // Desativa o brilho aditivo no Light Mode e usa um azul mais escuro e sólido
      this.catMatWire.color.setHex(this.isDarkMode ? 0x38bdf8 : 0x0284c7);
      this.catMatWire.blending = this.isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending;
      this.catMatWire.opacity = this.isDarkMode ? 0.25 : 0.5;
    }
    if (this.catMatPoints) {
      // Foca os pontos das vértices em um roxo profundo no modo claro
      this.catMatPoints.color.setHex(this.isDarkMode ? 0xd47fe0 : 0x9333ea);
      this.catMatPoints.blending = this.isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending;
      this.catMatPoints.opacity = this.isDarkMode ? 0.6 : 0.8;
    }
    if (this.bgParticles && this.bgParticles.material) {
      (this.bgParticles.material as THREE.PointsMaterial).color.setHex(this.isDarkMode ? 0x38bdf8 : 0x0284c7);
    }
    if (this.bgNebulas) {
      this.bgNebulas.visible = !this.isDarkMode; // Exibe as nebulosas EXCLUSIVAMENTE no modo claro
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.initThreeJS();
      this.initScrollObservers();
      if (this.isAnimated) {
        this.ngZone.runOutsideAngular(() => {
          this.animateLoop();
        });
      }
      // Força o cálculo do scroll inicial para que os objetos já nasçam corretamente afastados
      setTimeout(() => this.onWindowScroll(), 100);
      this.updateAnimationState();
    }
  }

  ngOnDestroy() {
    if (this.isBrowser) {
      cancelAnimationFrame(this.animationFrameId);
      this.renderer?.dispose();
      this.bgParticles?.geometry.dispose();
      (this.bgParticles?.material as THREE.Material).dispose();

      this.bgNebulas?.geometry.dispose();
      (this.bgNebulas?.material as THREE.Material).dispose();
      
      this.cyberCat?.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Points || child instanceof THREE.LineSegments) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
      this.hexLattice?.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
      this.dbSymbol?.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
      this.cleanArchSymbol?.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
      this.aiNode?.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
      this.gitTree?.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
      this.obsidianGraph?.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.LineSegments) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else child.material.dispose();
        }
      });
      gsap.killTweensOf(this.cyberCat?.position);
      gsap.killTweensOf(this.cyberCat?.rotation);
      gsap.killTweensOf(this.cyberCat?.userData);
      gsap.killTweensOf(this.hexLattice?.position);
      gsap.killTweensOf(this.hexLattice?.userData);
      gsap.killTweensOf(this.dbSymbol?.position);
      gsap.killTweensOf(this.dbSymbol?.userData);
      gsap.killTweensOf(this.cleanArchSymbol?.position);
      gsap.killTweensOf(this.cleanArchSymbol?.userData);
      gsap.killTweensOf(this.aiNode?.position);
      gsap.killTweensOf(this.aiNode?.userData);
      gsap.killTweensOf(this.gitTree?.position);
      gsap.killTweensOf(this.gitTree?.userData);
      gsap.killTweensOf(this.obsidianGraph?.position);
      gsap.killTweensOf(this.obsidianGraph?.userData);
      gsap.killTweensOf(".content-block");
    }
  }

  private animateLoop = () => {
    if (!this.isAnimated || !this.isBrowser) return;
    this.animationFrameId = requestAnimationFrame(this.animateLoop);
    
    const elapsedTime = this.clock.getElapsedTime();
    
    this.bgParticles.rotation.y = elapsedTime * 0.02;
    this.bgParticles.rotation.x = elapsedTime * 0.01;
    
    if (this.bgNebulas) {
      this.bgNebulas.rotation.y = elapsedTime * 0.005;
      this.bgNebulas.rotation.z = elapsedTime * 0.002;
    }

    // Flutuação total em X, Y, Z sem brigar com o GSAP
    this.cyberCat.position.x = this.cyberCat.userData['baseX'] + Math.sin(elapsedTime * 1.2) * 0.8;
    this.cyberCat.position.y = this.cyberCat.userData['baseY'] + Math.sin(elapsedTime * 1.5) * 0.8;
    this.cyberCat.position.z = this.cyberCat.userData['baseZ'] + Math.cos(elapsedTime * 1.3) * 0.8;
    this.cyberCat.rotation.x = 0.2 + Math.sin(elapsedTime * 2) * 0.2;
    this.cyberCat.rotation.z = Math.sin(elapsedTime * 1.5) * 0.2;

    this.dbSymbol.position.x = this.dbSymbol.userData['baseX'] + Math.cos(elapsedTime * 1.0) * 0.5;
    this.dbSymbol.position.y = this.dbSymbol.userData['baseY'] + Math.sin(elapsedTime * 1.2) * 0.6;
    this.dbSymbol.position.z = this.dbSymbol.userData['baseZ'] + Math.sin(elapsedTime * 1.4) * 0.5;
    this.dbSymbol.rotation.y = elapsedTime * 0.6;
    this.dbSymbol.rotation.x = Math.sin(elapsedTime * 1.5) * 0.3;
    
    this.hexLattice.position.x = this.hexLattice.userData['baseX'] + Math.sin(elapsedTime * 1.1) * 0.5;
    this.hexLattice.position.y = this.hexLattice.userData['baseY'] + Math.cos(elapsedTime * 1.3) * 0.6;
    this.hexLattice.position.z = this.hexLattice.userData['baseZ'] + Math.cos(elapsedTime * 1.2) * 0.5;
    this.hexLattice.rotation.z = elapsedTime * 0.3;
    this.hexLattice.rotation.x = 0.5 + Math.sin(elapsedTime * 1.2) * 0.3;

    if (this.cleanArchSymbol) {
        this.cleanArchSymbol.position.x = this.cleanArchSymbol.userData['baseX'] + Math.sin(elapsedTime * 1.4) * 0.6;
        this.cleanArchSymbol.position.y = this.cleanArchSymbol.userData['baseY'] + Math.cos(elapsedTime * 1.5) * 0.8;
        this.cleanArchSymbol.position.z = this.cleanArchSymbol.userData['baseZ'] + Math.sin(elapsedTime * 1.6) * 0.6;
        this.cleanArchSymbol.children.forEach((ring, i) => {
            if (ring.name === 'archRing') { // Gira apenas os anéis (ignora a hitbox invisível)
                ring.rotation.z = elapsedTime * 0.8 * (i % 2 === 0 ? -1 : 1);
                ring.rotation.x = Math.PI / 2 + Math.sin(elapsedTime * 2 + i) * 0.35;
            }
        });
        this.cleanArchSymbol.rotation.y = elapsedTime * 0.5 + (this.cleanArchSymbol.userData['spinOffset'] || 0);
        const scalePulse = 0.6 + Math.sin(elapsedTime * 3) * 0.05;
        this.cleanArchSymbol.scale.set(scalePulse, scalePulse, scalePulse);
    }
    if (this.aiNode) {
        this.aiNode.position.x = this.aiNode.userData['baseX'] + Math.cos(elapsedTime * 1.5) * 0.5;
        this.aiNode.position.y = this.aiNode.userData['baseY'] + Math.sin(elapsedTime * 1.8) * 0.6;
        this.aiNode.position.z = this.aiNode.userData['baseZ'] + Math.cos(elapsedTime * 1.7) * 0.5;
        this.aiNode.rotation.y = elapsedTime * 0.5;
        this.aiNode.rotation.z = Math.sin(elapsedTime * 2) * 0.25;
        ((this.aiNode.children[0] as THREE.Mesh).material as THREE.Material).opacity = 0.3 + Math.sin(elapsedTime * 6) * 0.4;
    }
    if (this.gitTree) {
        this.gitTree.position.x = this.gitTree.userData['baseX'] + Math.sin(elapsedTime * 1.7) * 0.5;
        this.gitTree.position.y = this.gitTree.userData['baseY'] + Math.sin(elapsedTime * 2.0) * 0.6;
        this.gitTree.position.z = this.gitTree.userData['baseZ'] + Math.cos(elapsedTime * 1.9) * 0.5;
        this.gitTree.rotation.y = elapsedTime * 0.5;
        this.gitTree.rotation.z = Math.sin(elapsedTime * 1.5) * 0.25 + Math.sin(this.gitTree.userData['rotOffset'] || 0) * 0.4;
    }
    if (this.obsidianGraph) {
        this.obsidianGraph.position.x = this.obsidianGraph.userData['baseX'] + Math.cos(elapsedTime * 1.3) * 0.5;
        this.obsidianGraph.position.y = this.obsidianGraph.userData['baseY'] + Math.sin(elapsedTime * 1.4) * 0.6;
        this.obsidianGraph.position.z = this.obsidianGraph.userData['baseZ'] + Math.sin(elapsedTime * 1.2) * 0.5;
        this.obsidianGraph.rotation.x = elapsedTime * 0.4;
        this.obsidianGraph.rotation.y = elapsedTime * 0.5;
        const obsScale = 1 + Math.sin(elapsedTime * 3) * 0.1;
        this.obsidianGraph.scale.setScalar(obsScale);
    }
    
    this.renderer.render(this.scene, this.camera);
  };

  private initThreeJS() {
    this.setupScene();
    this.createBackground();
    this.createCyberCat();
    this.createDatabaseSymbol();
    this.createHexLattice();
    this.createAiNode();
    this.createCleanArchSymbol();
    this.createGitTree();
    this.createObsidianGraph();
  }

  private setupScene() {
    const container = this.canvasContainer.nativeElement;
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 25; // Afasta a câmera

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);
  }

  private createBackground() {
    // Textura procedural para brilho suave (Orbs de Fogo/Energia)
    const canvas = document.createElement('canvas');
    canvas.width = 32; canvas.height = 32;
    const context = canvas.getContext('2d')!;
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,200,100,0.8)');
    gradient.addColorStop(1, 'rgba(255,100,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    const particleTexture = new THREE.CanvasTexture(canvas);

    // Campo de Partículas de Fundo (Poeira Estelar / Cyber Nodes)
    const bgGeo = new THREE.BufferGeometry();
    const bgCount = 1500;
    const bgPos = new Float32Array(bgCount * 3);
    for(let i = 0; i < bgCount * 3; i++) {
      bgPos[i] = (Math.random() - 0.5) * 120; // Espalha as partículas de forma vasta
    }
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
    const bgMat = new THREE.PointsMaterial({ 
      color: this.isDarkMode ? 0x38bdf8 : 0x0284c7, size: 0.4, map: particleTexture, transparent: true, depthWrite: false, opacity: 0.6, blending: THREE.AdditiveBlending 
    });
    this.bgParticles = new THREE.Points(bgGeo, bgMat);
    this.scene.add(this.bgParticles);

    // --- NEBULOSAS (Gases e Nuvens ao Fundo) ---
    const nebulaCanvas = document.createElement('canvas');
    nebulaCanvas.width = 128; nebulaCanvas.height = 128;
    const nebulaCtx = nebulaCanvas.getContext('2d')!;
    const nebulaGradient = nebulaCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    nebulaGradient.addColorStop(0, 'rgba(255,255,255,0.6)'); // Densidade central restaurada para ser visível
    nebulaGradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
    nebulaGradient.addColorStop(1, 'rgba(255,255,255,0)');
    nebulaCtx.fillStyle = nebulaGradient;
    nebulaCtx.fillRect(0, 0, 128, 128);
    const nebulaTexture = new THREE.CanvasTexture(nebulaCanvas);

    const nebulaGeo = new THREE.BufferGeometry();
    const nebulaCount = 45;
    const nebulaPos = new Float32Array(nebulaCount * 3);
    for(let i = 0; i < nebulaCount * 3; i+=3) {
      nebulaPos[i] = (Math.random() - 0.5) * 180;
      nebulaPos[i+1] = (Math.random() - 0.5) * 180;
      nebulaPos[i+2] = (Math.random() - 0.5) * 80 - 30; // Mais espalhadas e jogadas para o fundo
    }
    nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPos, 3));
    const nebulaMat = new THREE.PointsMaterial({
      color: 0x7e22ce, size: 80, map: nebulaTexture, transparent: true, depthWrite: false, opacity: 0, blending: THREE.NormalBlending
    });
    this.bgNebulas = new THREE.Points(nebulaGeo, nebulaMat);
    this.bgNebulas.visible = !this.isDarkMode; // Inicia respeitando a regra do tema
    this.scene.add(this.bgNebulas);
  }

  private createCyberCat() {
    // --- O GATO CIBERNÉTICO DE SCHRÖDINGER ---
    this.cyberCat = new THREE.Group();
    
    const pos: number[] = [];
    const addTri = (v1: number[], v2: number[], v3: number[]) => pos.push(...v1, ...v2, ...v3);

    // Vértices da cabeça do Low-Poly Cat
    const n = [0, -0.5, 0.8]; // Focinho
    const b = [0, 0.2, 0.9];  // Ponte do nariz
    const el = [-0.7, 0.5, 0.6]; // Olho Esq
    const er = [0.7, 0.5, 0.6];  // Olho Dir
    const etl = [-1.5, 2.2, 0]; // Ponta da Orelha Esq
    const etr = [1.5, 2.2, 0];  // Ponta da Orelha Dir
    const ebol = [-2.0, 0.5, -0.2]; // Base Ext Orelha Esq
    const ebor = [2.0, 0.5, -0.2];  // Base Ext Orelha Dir
    const ebil = [-0.8, 1.4, 0.2]; // Base Int Orelha Esq
    const ebir = [0.8, 1.4, 0.2];  // Base Int Orelha Dir
    const ht = [0, 1.5, 0.3]; // Topo da Cabeça
    const cl = [-1.4, -0.5, 0.2]; // Bochecha Esq
    const cr = [1.4, -0.5, 0.2]; // Bochecha Dir
    const j = [0, -1.2, 0.3]; // Queixo

    addTri(b, el, n); addTri(b, n, er); addTri(ht, el, b); addTri(ht, b, er);
    addTri(ht, ebil, el); addTri(ht, er, ebir); addTri(etl, ebol, ebil); addTri(etr, ebir, ebor);
    addTri(ebil, ebol, el); addTri(ebir, er, ebor); addTri(el, ebol, cl); addTri(er, cr, ebor);
    addTri(el, cl, n); addTri(er, n, cr); addTri(n, cl, j); addTri(n, j, cr);

    const catGeo = new THREE.BufferGeometry();
    catGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    catGeo.computeVertexNormals();

    this.catMatSolid = new THREE.MeshBasicMaterial({ color: this.isDarkMode ? 0x050810 : 0xfdfcf8, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1 });
    this.catMatWire = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending });
    this.catMatPoints = new THREE.PointsMaterial({ color: 0xd47fe0, size: 0.15, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });

    this.cyberCat.add(new THREE.Mesh(catGeo, this.catMatSolid));
    this.cyberCat.add(new THREE.Mesh(catGeo, this.catMatWire));
    this.cyberCat.add(new THREE.Points(catGeo, this.catMatPoints));

    // Bigodes (Whiskers Cibernéticos)
    const whiskerPos = [ -1.4,-0.2,0.2, -3.0,0.0,0.1, -1.4,-0.4,0.2, -3.2,-0.5,0.2, -1.4,-0.6,0.2, -2.8,-1.0,0.3, 1.4,-0.2,0.2, 3.0,0.0,0.1, 1.4,-0.4,0.2, 3.2,-0.5,0.2, 1.4,-0.6,0.2, 2.8,-1.0,0.3 ];
    const whiskerGeo = new THREE.BufferGeometry();
    whiskerGeo.setAttribute('position', new THREE.Float32BufferAttribute(whiskerPos, 3));
    const whiskerMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
    this.cyberCat.add(new THREE.LineSegments(whiskerGeo, whiskerMat));

    // Olhos Brilhantes Roxos
    const eyeGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x9f12a6 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat); leftEye.position.set(-0.7, 0.45, 0.65); leftEye.name = 'leftEye';
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat); rightEye.position.set(0.7, 0.45, 0.65); rightEye.name = 'rightEye';
    this.cyberCat.add(leftEye); this.cyberCat.add(rightEye);

    this.cyberCat.position.set(8, -1, 15); // Gato mais alto e um pouco mais para trás
    this.cyberCat.userData = { baseX: 8, baseY: -1, baseZ: 15 };
    this.cyberCat.rotation.set(0.2, -0.5, 0.1);
    this.cyberCat.scale.set(0.8, 0.8, 0.8);
    this.scene.add(this.cyberCat);
  }

  private createDatabaseSymbol() {
    // --- SÍMBOLO DE BANCO DE DADOS (PostgreSQL/Backend) ---
    this.dbSymbol = new THREE.Group();
    const dbMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
    const dbCylinderGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 24, 1, true);
    const dbCylinder = new THREE.Mesh(dbCylinderGeo, dbMat);
    this.dbSymbol.add(dbCylinder);
    for (let i = 0; i < 2; i++) {
        const dbCylinderMore = new THREE.Mesh(dbCylinderGeo, dbMat);
        dbCylinderMore.position.y = 0.7 * (i + 1);
        this.dbSymbol.add(dbCylinderMore);
    }
    this.dbSymbol.position.set(-30, -10, -50);
    this.dbSymbol.userData = { baseX: -30, baseY: -10, baseZ: -50 };
    this.dbSymbol.scale.set(0.8, 0.8, 0.8);
    this.dbSymbol.rotation.set(0.4, 0.5, 0);
    this.scene.add(this.dbSymbol);
  }

  private createHexLattice() {
    // --- LATTICE HEXAGONAL (Arquitetura Hexagonal) ---
    this.hexLattice = new THREE.Group();
    const hexMat = new THREE.LineBasicMaterial({ color: 0x9100a6, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending });
    const hexGeo = new THREE.RingGeometry(1, 1.05, 6);
    const hexRadius = 1.05 * Math.sqrt(3);
    for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
            if (Math.abs(i) + Math.abs(j) > 3) continue;
            const hex = new THREE.LineSegments(hexGeo, hexMat);
            hex.position.x = j * hexRadius;
            hex.position.y = i * 1.5 * 1.05 + (j % 2 === 0 ? 0 : 0.75 * 1.05);
            hex.rotation.z = Math.PI / 2;
            this.hexLattice.add(hex);
        }
    }
    this.hexLattice.position.set(30, -10, -50);
    this.hexLattice.userData = { baseX: 30, baseY: -10, baseZ: -50 };
    this.hexLattice.rotation.set(0.5, 0, 0.2);
    this.scene.add(this.hexLattice);
  }

  private createAiNode() {
    // --- NÓ DE REDE NEURAL (IA / MAS) ---
    this.aiNode = new THREE.Group();
    const nodeCoreGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const nodeCoreMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
    const nodeCore = new THREE.Mesh(nodeCoreGeo, nodeCoreMat);
    this.aiNode.add(nodeCore);
    const connections: number[] = [0,0,0, 4,2,1, 0,0,0, -4,3,-2, 0,0,0, 3,-3,1, 0,0,0, -2,-2,-2, 0,0,0, 5,0,0];
    const nodeLinesGeo = new THREE.BufferGeometry();
    nodeLinesGeo.setAttribute('position', new THREE.Float32BufferAttribute(connections, 3));
    const nodeLinesMat = new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
    this.aiNode.add(new THREE.LineSegments(nodeLinesGeo, nodeLinesMat));
    this.aiNode.position.set(-34, -18, -60); // Aguarda lá no fundo (esquerda)
    this.aiNode.userData = { baseX: -34, baseY: -18, baseZ: -60 };
    this.aiNode.scale.set(0.7, 0.7, 0.7);
    this.scene.add(this.aiNode);
  }

  private createCleanArchSymbol() {
    // --- ANÉIS CONCÊNTRICOS (Clean Architecture / DDD) ---
    this.cleanArchSymbol = new THREE.Group();
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, wireframe: true, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
    for (let i = 1; i <= 4; i++) {
        const ringGeo = new THREE.TorusGeometry(i * 1.2, 0.05, 8, 48);
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.name = 'archRing';
        this.cleanArchSymbol.add(ring);
    }
    
    // Hitbox invisível gigante ao redor do símbolo para facilitar o clique com o mouse!
    const hitGeo = new THREE.SphereGeometry(5.0, 16, 16);
    const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    this.cleanArchSymbol.add(new THREE.Mesh(hitGeo, hitMat));

    this.cleanArchSymbol.position.set(-18, 8, -25); // Ajustado para descer e ir para a direita no scroll
    this.cleanArchSymbol.userData = { baseX: -18, baseY: 8, baseZ: -25 };
    this.cleanArchSymbol.scale.set(0.6, 0.6, 0.6);
    this.scene.add(this.cleanArchSymbol);
  }

  private createGitTree() {
    // --- GIT TREE (Git-as-a-Database / CI) ---
    this.gitTree = new THREE.Group();
    const gitNodeGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const gitNodeMat = new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
    const lineMat = new THREE.LineBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
    
    const nodes = [ [0, 0, 0], [0, 2, 0], [0, 4, 0], [2, 1, 0], [2, 3, 0] ]; // main e feat branch
    nodes.forEach(pos => {
      const node = new THREE.Mesh(gitNodeGeo, gitNodeMat);
      node.position.set(pos[0], pos[1], pos[2]);
      this.gitTree.add(node);
    });
    
    const edges = [ 0,0,0, 0,2,0,  0,2,0, 0,4,0,  0,0,0, 2,1,0,  2,1,0, 2,3,0,  2,3,0, 0,4,0 ];
    const gitEdgesGeo = new THREE.BufferGeometry();
    gitEdgesGeo.setAttribute('position', new THREE.Float32BufferAttribute(edges, 3));
    this.gitTree.add(new THREE.LineSegments(gitEdgesGeo, lineMat));
    this.gitTree.position.set(34, -22, -60); // Aguarda lá no fundo (direita)
    this.gitTree.userData = { baseX: 34, baseY: -22, baseZ: -60 };
    this.scene.add(this.gitTree);
  }

  private createObsidianGraph() {
    // --- OBSIDIAN GRAPH (Second Brain) ---
    this.obsidianGraph = new THREE.Group();
    const obsNodeGeo = new THREE.OctahedronGeometry(0.4, 0);
    const obsNodeMat = new THREE.MeshBasicMaterial({ color: 0xd47fe0, wireframe: true, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
    const obsLineMat = new THREE.LineBasicMaterial({ color: 0xd47fe0, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending });
    
    const obsNodes: number[] = [];
    for(let i=0; i<15; i++) obsNodes.push((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
    for(let i=0; i<obsNodes.length; i+=3) {
      const node = new THREE.Mesh(obsNodeGeo, obsNodeMat);
      node.position.set(obsNodes[i], obsNodes[i+1], obsNodes[i+2]);
      this.obsidianGraph.add(node);
    }
    
    const obsEdges: number[] = [];
    for(let i=0; i<obsNodes.length; i+=3) {
      for(let j=i+3; j<obsNodes.length; j+=3) {
        if (Math.random() > 0.75) obsEdges.push(obsNodes[i], obsNodes[i+1], obsNodes[i+2], obsNodes[j], obsNodes[j+1], obsNodes[j+2]);
      }
    }
    const obsEdgesGeo = new THREE.BufferGeometry();
    obsEdgesGeo.setAttribute('position', new THREE.Float32BufferAttribute(obsEdges, 3));
    this.obsidianGraph.add(new THREE.LineSegments(obsEdgesGeo, obsLineMat));
    this.obsidianGraph.position.set(0, -30, -40);
    this.obsidianGraph.userData = { baseX: 0, baseY: -30, baseZ: -40 };
    this.scene.add(this.obsidianGraph);
  }

  private initScrollObservers() {
    const blocks = document.querySelectorAll('.content-block');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (this.isAnimated) {
            gsap.to(entry.target, { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' });
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    blocks.forEach(block => observer.observe(block));
  }

  @HostListener('window:click', ['$event'])
  onMouseClick(event: MouseEvent) {
    if (!this.isBrowser || !this.camera || !this.scene || !this.isAnimated) return;

    // Converte a posição do mouse na tela para coordenadas do WebGL (-1 a +1)
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Encontra todos os objetos que o laser (Raycaster) tocou
    const intersects = this.raycaster.intersectObjects(this.scene.children, true);

    if (intersects.length > 0) {
      let object: THREE.Object3D | null = intersects[0].object;
      
      // Sobe a árvore de nós até chegar no Grupo Principal (Ex: cyberCat, aiNode, etc)
      while (object && object.parent && object.parent !== this.scene) {
        object = object.parent;
      }

      if (object === this.cyberCat) {
        this.animateCatBlink();
      } else if (object === this.cleanArchSymbol) {
        this.animateCleanArchSpin();
      } else if (object === this.aiNode) {
        this.animateAiNodePulse();
      } else if (object === this.gitTree) {
        this.animateGitTreeShake();
      }
    }
  }

  private animateCatBlink() {
    const leftEye = this.cyberCat.getObjectByName('leftEye');
    const rightEye = this.cyberCat.getObjectByName('rightEye');
    if (leftEye && rightEye) {
      gsap.killTweensOf([leftEye.scale, rightEye.scale]);
      leftEye.scale.set(1, 1, 1);
      rightEye.scale.set(1, 1, 1);
      
      gsap.to([leftEye.scale, rightEye.scale], {
        y: 0.1, // Achata os olhos no eixo Y (Piscada)
        duration: 0.15,
        yoyo: true, // Faz a animação voltar e abrir os olhos
        repeat: 1,
        ease: 'power1.inOut'
      });
    }
  }

  private animateCleanArchSpin() {
    gsap.killTweensOf(this.cleanArchSymbol.userData, "spinOffset");
    this.cleanArchSymbol.userData['spinOffset'] = this.cleanArchSymbol.userData['spinOffset'] || 0;
    gsap.to(this.cleanArchSymbol.userData, {
      spinOffset: this.cleanArchSymbol.userData['spinOffset'] + Math.PI * 4, // Gira velozmente em 2 voltas completas extras
      duration: 1.5,
      ease: 'power3.inOut'
    });
  }

  private animateAiNodePulse() {
    gsap.killTweensOf(this.aiNode.scale);
    this.aiNode.scale.set(0.7, 0.7, 0.7); // Reseta a escala atual
    gsap.to(this.aiNode.scale, { x: 1.1, y: 1.1, z: 1.1, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.out' }); // Pulsa gigante
  }

  private animateGitTreeShake() {
    gsap.killTweensOf(this.gitTree.userData, "rotOffset");
    this.gitTree.userData['rotOffset'] = 0;
    gsap.to(this.gitTree.userData, { rotOffset: Math.PI * 4, duration: 0.6, ease: 'power2.out', onComplete: () => { this.gitTree.userData['rotOffset'] = 0; } }); // Oscila freneticamente com a força do seno
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (!this.isBrowser || !this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (!this.isBrowser || !this.bgParticles || !this.canvasContainer || !this.isAnimated) return;
    
    const container = this.canvasContainer.nativeElement.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scrollableDistance = rect.height - window.innerHeight;
    
    if (scrollableDistance <= 0) return;

    // Removida a trava do zero! Permitimos que scrollP seja negativo.
    // Isso faz com que a animação comece IMEDIATAMENTE enquanto o usuário ainda está na Hero.
    let scrollP = -rect.top / scrollableDistance;
    scrollP = Math.min(1, scrollP); // Apenas limitamos o fim do scroll
    
    // Gatinho: Se scrollP < 0 (usuário na Hero), ele vem de muito longe (-Z). Quando chega na Div 1 (scrollP = 0), ele entra em foco absoluto (Z=15)!
    const catZ = scrollP < 0 ? 15 + (scrollP * 120) : 15 - (scrollP * 50);

    gsap.to(this.cyberCat.userData, { baseX: 8 - (scrollP * 20), baseY: -1 + (scrollP * 10), baseZ: catZ, duration: 1, ease: 'power2.out' });
    gsap.to(this.cyberCat.rotation, { y: -0.5 + (scrollP * 3), duration: 1, ease: 'power2.out' });

    // Clean Arch: Aproxima-se brutalmente pela esquerda na Div 2 (scroll ~0.33)
    if (this.cleanArchSymbol) {
      gsap.to(this.cleanArchSymbol.userData, { baseX: -18 + (scrollP * 24), baseY: 8 - (scrollP * 30), baseZ: -25 + (scrollP * 105), duration: 1, ease: 'power2.out' });
    }

    // Elementos da Div 3 (Efeito de transição)
    if (this.dbSymbol) {
      gsap.to(this.dbSymbol.userData, { baseX: -30 + (scrollP * 21), baseY: -10 + (scrollP * 15), baseZ: -50 + (scrollP * 83), duration: 1, ease: 'power2.out' });
    }
    if (this.hexLattice) {
      gsap.to(this.hexLattice.userData, { baseX: 30 - (scrollP * 21), baseY: -10 + (scrollP * 15), baseZ: -50 + (scrollP * 83), duration: 1, ease: 'power2.out' });
    }
    
    // AI Node e Git Tree: Um de cada lado flanqueando o texto da última Div (scroll ~1.0)
    if (this.aiNode) {
      gsap.to(this.aiNode.userData, { baseX: -34 + (scrollP * 20), baseY: -18 + (scrollP * 18), baseZ: -60 + (scrollP * 70), duration: 1, ease: 'power2.out' });
    }
    if (this.gitTree) {
      gsap.to(this.gitTree.userData, { baseX: 34 - (scrollP * 20), baseY: -22 + (scrollP * 22), baseZ: -60 + (scrollP * 70), duration: 1, ease: 'power2.out' });
    }
    if (this.obsidianGraph) {
      gsap.to(this.obsidianGraph.userData, { baseX: 0, baseY: -30 + (scrollP * 30), baseZ: -40 + (scrollP * 30), duration: 1, ease: 'power2.out' });
    }
    
    // O fundo se move lentamente no eixo Y criando um efeito de Parallax imersivo
    gsap.to(this.bgParticles.position, { y: scrollP * 30, duration: 0.5, ease: 'power1.out' });
    if (this.bgNebulas) {
      gsap.to(this.bgNebulas.position, { y: scrollP * 15, duration: 0.5, ease: 'power1.out' });
      
      // Garante que não apareçam no header (Hero), surgindo em fade-in apenas quando a seção Hello assume a tela
      const targetOpacity = scrollP <= 0 ? 0 : 0.8; // Volta a ficar muito mais visível durante o scroll
      gsap.to(this.bgNebulas.material, { opacity: targetOpacity, duration: 1, ease: 'power2.out' });
    }
  }
}
