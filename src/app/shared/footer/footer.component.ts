import { Component, OnInit } from '@angular/core';

import * as THREE from 'three';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {


  ngOnInit(): void {

    // const canvas = document.querySelector("#footer-container") as HTMLCanvasElement ;
    // const renderer = new THREE.WebGLRenderer();

    // const scene = new THREE.Scene();
    // scene.background = new THREE.Color('black');
   

    // const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    // scene.add(ambientLight);

    // const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100);
    // camera.position.z = 2;

    


    // renderer.setSize( window.innerWidth*0.98, window.innerHeight * 0.25 );
    // canvas?.appendChild( renderer.domElement );


    // const animate = () => {
    //   requestAnimationFrame(animate);
    //   renderer.render(scene, camera);
    // }

    // animate();
  }

}
