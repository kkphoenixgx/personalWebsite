import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

@Injectable({
  providedIn: 'root'
})
export class Text3dService {

  private textMesh: THREE.Mesh | undefined;
  private rotationProgress: number = 0; // Controla o progresso da rotação
  private scene: THREE.Scene | undefined; // Armazena a referência da cena

  constructor() { }

  createText(scene: THREE.Scene, text: string, color: number = 0xffffff): THREE.Mesh | undefined {
    this.scene = scene;

    const fontLoader = new FontLoader();

    fontLoader.load('assets/fonts/Merriweather_Regular.json', (font) => {
      const textGeometry = new TextGeometry(text, {
        font: font,
        size: 0.5,
        depth: 0.1,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.001,
        bevelSize: 0.002,
        bevelOffset: 0,
        bevelSegments: 1,
      });

      textGeometry.center();

      const textMaterial = new THREE.MeshBasicMaterial({ color });
      this.textMesh = new THREE.Mesh(textGeometry, textMaterial);

      scene.add(this.textMesh);
    });

    return this.textMesh;
  }

  rotateTextOnce(delta: number) {
    const fullRotation = Math.PI * 2; // Rotação completa (360 graus)

    if (this.textMesh && this.rotationProgress < fullRotation) {
      this.textMesh.rotation.x += delta; // Incrementa a rotação
      this.rotationProgress += delta; // Aumenta o progresso da rotação

      if (this.rotationProgress >= fullRotation) {
        this.textMesh.rotation.x = 0; // Garante que termine onde começou
        this.rotationProgress = fullRotation; // Finaliza a rotação
      }
    }
  }

  // Atualiza a cor do texto
  updateTextColor(color: number) {
    if (this.textMesh) {
      (this.textMesh.material as THREE.MeshBasicMaterial).color.set(color); // Atualiza a cor do material
    }
  }

  // Retorna a cena para que possamos acessar o background
  getScene() {
    return this.scene;
  }

  resetRotationProgress(){
    this.rotationProgress = 0;
  }
}