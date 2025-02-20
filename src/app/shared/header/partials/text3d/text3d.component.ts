import { Component, OnInit, Inject, PLATFORM_ID  } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { Text3dService } from '../../../../services/text3d.service.service';

import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-text3d',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './text3d.component.html',
  styleUrls: ['./text3d.component.scss']
})
export class Text3dComponent implements OnInit {

  public isDarkMode: boolean = true;
  public isAnimating: boolean = true;
  private renderer: THREE.WebGLRenderer | undefined;
  private scene: THREE.Scene | undefined;
  private camera: THREE.PerspectiveCamera | undefined;

  constructor(
    public darkModeService: DarkModeControllerService,
    public animateService: AnimationControllerService,
    private text3dService: Text3dService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  updateColors() {
    if (this.scene) {
      const newBackgroundColor = this.isDarkMode ? 0x000000 : 0xffffff;
      const newTextColor = this.isDarkMode ? 0xffffff : 0x000000;

      
      if(this.scene.background) this.scene.background = new THREE.Color(newBackgroundColor);
      else console.error("background undefined")

      this.text3dService.updateTextColor(newTextColor);
    }
  }

  ngOnInit() {

    // ----------- Observers -----------
    this.darkModeService.getDarkModeState().subscribe(state => {
      this.isDarkMode = state;
      this.updateColors();
    });

    this.animateService.getAnimationState().subscribe(state => {
      this.isAnimating = state;
    });

    // text 3d component

    if (isPlatformBrowser(this.platformId)) {
            
      window.addEventListener('resize', () => {
        if (this.renderer && this.camera) {
          const newWidth = window.innerWidth * 0.3;
          const newHeight = window.innerHeight * 0.15;

          this.renderer.setSize(newWidth, newHeight);
          this.camera.aspect = newWidth / newHeight;

          this.camera.updateProjectionMatrix();
        }
      });

      // ----------- THREE -----------
      const canvas = document.querySelector("#canvas") as HTMLCanvasElement;

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.scene = new THREE.Scene();

      // ----------- Background -----------
      this.scene.background = new THREE.Color(this.isDarkMode ? 0x000000 : 0xffffff);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      this.scene.add(ambientLight);

      this.camera = new THREE.PerspectiveCamera(75, (window.innerWidth * 0.7) / (window.innerHeight * 0.15), 0.1, 1000);
      this.camera.position.z = (window.innerWidth / window.innerHeight ) + (window.innerWidth < 450 ? 1 : 0 );

      const controls = new OrbitControls(this.camera, this.renderer.domElement);

      if (this.isAnimating && canvas) {
        this.renderer.setSize(window.innerWidth * 0.7, window.innerHeight * 0.15);
        canvas?.appendChild(this.renderer.domElement);
      }

      // ----------- Text -----------
      this.text3dService.createText(this.scene, 'KKPHOENIX', this.isDarkMode ? 0xffffff : 0x000000);

      const animate = () => {
        requestAnimationFrame(animate);
        this.renderer?.render(this.scene!, this.camera!);
      };

      if (this.isAnimating) {
        animate();
      }
    }

   
  }
}
