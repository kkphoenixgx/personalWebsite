import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { Text3dService } from '../../../../services/text3d.service.service';

@Component({
  selector: 'app-text3d',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text3d.component.html',
  styleUrls: ['./text3d.component.scss']
})
export class Text3dComponent implements OnInit {

  public isDarkMode = true;
  public isAnimating = true;

  private renderer?: THREE.WebGLRenderer;
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;

  constructor(
    public darkModeService: DarkModeControllerService,
    public animateService: AnimationControllerService,
    private text3dService: Text3dService,
  ) {}

  // ----------- LifeCycle -----------

  ngOnInit(): void {

    this.subscribeToServices();
    this.initThreejs();
    window.addEventListener('resize', () => this.resizeText());
  
  }

  // ----------- Main methods -----------

  private initThreejs(): void {
    this.createThreeJs();
    this.createBackground();
    this.createText();
    this.animate();
  }

  private createThreeJs(): void {
    const canvas = document.querySelector("#canvas") as HTMLCanvasElement | null;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.scene = new THREE.Scene();

    const aspectRatio = (window.innerWidth * 0.7) / (window.innerHeight * 0.15);
    this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    this.camera.position.z = (window.innerWidth / window.innerHeight) + (this.isMobile() ? 1 : 0);

    new OrbitControls(this.camera, this.renderer.domElement);

    if (this.isAnimating && canvas) {
      this.renderer.setSize(window.innerWidth * 0.7, window.innerHeight * 0.15);
      canvas.appendChild(this.renderer.domElement);
    }
  }

  private createBackground(): void {
    if (!this.scene) return;
    this.scene.background = new THREE.Color(this.isDarkMode ? 0x000000 : 0xffffff);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);
  }

  private createText(): void {
    if (!this.scene) return;
    const color = this.isDarkMode ? 0xffffff : 0x000000;
    this.text3dService.createText(this.scene, 'KKPHOENIX', color);
    this.resizeText();
  }

  public resizeText(): void { 
    if (!this.renderer || !this.camera) return;
    const isMobile = this.isMobile(); 
    
    const newWidth = isMobile ? window.innerWidth * 0.55 : window.innerWidth * 0.8; 
    const newHeight = window.innerHeight * 0.15; 
   
    const proportion = newWidth / newHeight; 
    
    this.renderer.setSize(newWidth, newHeight); 
    this.camera.aspect = proportion; 

    this.updateCameraZ(); 
    this.camera.updateProjectionMatrix(); 
  }

  public updateCameraZ(): void { 
    if (!this.camera) return; 

    const isMobile = this.isMobile(); 
    
    const width = window.innerWidth; 
    const zOffset = isMobile ? 
      this.getMobileZOffset(width) : this.getDesktopZOffset(width); 
    
    const proportion = this.renderer?.domElement.width! / this.renderer?.domElement.height!; 
    
    this.camera.position.z = proportion + zOffset; 
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    if (this.isAnimating && this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // ----------- Darkmode and Animation controll -----------

  private subscribeToServices(): void {
    this.darkModeService.getDarkModeObserbable().subscribe(state => {
      this.isDarkMode = state;
      this.updateColors();
    });

    this.animateService.getAnimationObserbable().subscribe(state => {
      this.isAnimating = state;
    });
  }

  private updateColors(): void {
    if (!this.scene) return;

    const bgColor = this.isDarkMode ? 0x000000 : 0xffffff;
    const textColor = this.isDarkMode ? 0xffffff : 0x000000;

    this.scene.background = new THREE.Color(bgColor);
    this.text3dService.updateTextColor(textColor);
  }

  // ----------- Side Methods -----------

  private isMobile(): boolean {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
  private getMobileZOffset(width: number): number { 
    if (width < 450) return 1; 
    if (width < 560) return -0.5; 
    if (width < 600) return -0.7; 
    if (width < 700) return -1; 
    return -1.5; 
  }
  private getDesktopZOffset(width: number): number { 
    return Math.max(-10, Math.min(-1.3, -0.01 * width + 3)); 
  }

  

}