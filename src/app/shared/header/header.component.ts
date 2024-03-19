import { Component, OnInit } from '@angular/core';

// Icons
import { MatIconModule } from '@angular/material/icon';

import * as THREE from 'three';
// Add-ons Three.js

import {FontLoader} from "three/examples/jsm/loaders/FontLoader.js"
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CommonModule } from '@angular/common';
import { LampComponent } from '../lamp/lamp.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, CommonModule, LampComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})

export class HeaderComponent implements OnInit {
  
    public toogleLamp: boolean = false;
  
    ngOnInit(): void {
  
      const canvas = document.querySelector("#canvas") as HTMLCanvasElement ;
      const renderer = new THREE.WebGLRenderer();
  
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('black');
      scene.fog = new THREE.Fog(0xffffff, 0, 750);
  
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
      scene.add(ambientLight)
  
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100);
      // camera.position.y = 2;
      camera.position.z = 2;
  
  
      const controls = new OrbitControls(camera, renderer.domElement);
  
      renderer.setSize( window.innerWidth *0.15, window.innerHeight * 0.15 );
      canvas?.appendChild( renderer.domElement );
  
      //Fonts
      const fontLoader = new FontLoader()
      fontLoader.load(
          '../../../assets/fonts/Merriweather_Regular.json', (font) => {
              const textGeometry = new TextGeometry(
                  'KKPHOENIX',
                  {
                      font: font,
                      size: 0.5,
                      height: 0.1,
                      curveSegments: 12,
                      bevelEnabled: true,
                      bevelThickness: 0.001,
                      bevelSize: 0.002,
                      bevelOffset: 0,
                      bevelSegments: 1
                  }
              )
  
              const textMaterial = new THREE.MeshBasicMaterial()
              const text = new THREE.Mesh(textGeometry, textMaterial)
              text.position.x-=2
              text.position.y = -0.2
              scene.add(text)
          }
      )
  
      const animate = () => {
          requestAnimationFrame(animate)
          renderer.render(scene, camera);
      }
  
      animate();
    }
  
    handleMenuClick(): void {
      this.toogleLamp = !this.toogleLamp;

    }
  
}