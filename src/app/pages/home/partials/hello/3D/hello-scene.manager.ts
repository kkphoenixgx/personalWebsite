import * as THREE from 'three';
import gsap from 'gsap';
import { HelloModelsFactory, HelloModels } from './hello-models.factory';

export class HelloSceneManager {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  
  private models!: HelloModels;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  constructor(private container: HTMLDivElement) {}

  public init(isDarkMode: boolean) {
    this.scene = new THREE.Scene();
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 25;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.models = HelloModelsFactory.createAllModels(isDarkMode);
    this.scene.add(this.models.bgParticles);
    this.scene.add(this.models.bgNebulas);
    this.scene.add(this.models.cyberCat);
    this.scene.add(this.models.dbSymbol);
    this.scene.add(this.models.hexLattice);
    this.scene.add(this.models.aiNode);
    this.scene.add(this.models.cleanArchSymbol);
    this.scene.add(this.models.gitTree);
    this.scene.add(this.models.obsidianGraph);
  }

  public updateTheme(isDarkMode: boolean) {
    if (!this.models) return;
    this.models.catMatSolid.color.setHex(isDarkMode ? 0x050810 : 0xe2e8f0);
    
    this.models.catMatWire.color.setHex(isDarkMode ? 0x38bdf8 : 0x0284c7);
    this.models.catMatWire.blending = isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending;
    this.models.catMatWire.opacity = isDarkMode ? 0.25 : 0.5;
    
    this.models.catMatPoints.color.setHex(isDarkMode ? 0xd47fe0 : 0x9333ea);
    this.models.catMatPoints.blending = isDarkMode ? THREE.AdditiveBlending : THREE.NormalBlending;
    this.models.catMatPoints.opacity = isDarkMode ? 0.6 : 0.8;
    
    if (this.models.bgParticles.material) {
      (this.models.bgParticles.material as THREE.PointsMaterial).color.setHex(isDarkMode ? 0x38bdf8 : 0x0284c7);
    }
    this.models.bgNebulas.visible = !isDarkMode;
  }

  public animate(elapsedTime: number) {
    if (!this.models || !this.scene || !this.camera) return;

    const { bgParticles, bgNebulas, cyberCat, dbSymbol, hexLattice, cleanArchSymbol, aiNode, gitTree, obsidianGraph } = this.models;

    bgParticles.rotation.y = elapsedTime * 0.02;
    bgParticles.rotation.x = elapsedTime * 0.01;
    
    if (bgNebulas) {
      bgNebulas.rotation.y = elapsedTime * 0.005;
      bgNebulas.rotation.z = elapsedTime * 0.002;
    }

    cyberCat.position.x = cyberCat.userData['baseX'] + Math.sin(elapsedTime * 1.2) * 0.8;
    cyberCat.position.y = cyberCat.userData['baseY'] + Math.sin(elapsedTime * 1.5) * 0.8;
    cyberCat.position.z = cyberCat.userData['baseZ'] + Math.cos(elapsedTime * 1.3) * 0.8;
    cyberCat.rotation.x = 0.2 + Math.sin(elapsedTime * 2) * 0.2;
    cyberCat.rotation.z = Math.sin(elapsedTime * 1.5) * 0.2;

    dbSymbol.position.x = dbSymbol.userData['baseX'] + Math.cos(elapsedTime * 1.0) * 0.5;
    dbSymbol.position.y = dbSymbol.userData['baseY'] + Math.sin(elapsedTime * 1.2) * 0.6;
    dbSymbol.position.z = dbSymbol.userData['baseZ'] + Math.sin(elapsedTime * 1.4) * 0.5;
    dbSymbol.rotation.y = elapsedTime * 0.6;
    dbSymbol.rotation.x = Math.sin(elapsedTime * 1.5) * 0.3;
    
    hexLattice.position.x = hexLattice.userData['baseX'] + Math.sin(elapsedTime * 1.1) * 0.5;
    hexLattice.position.y = hexLattice.userData['baseY'] + Math.cos(elapsedTime * 1.3) * 0.6;
    hexLattice.position.z = hexLattice.userData['baseZ'] + Math.cos(elapsedTime * 1.2) * 0.5;
    hexLattice.rotation.y = elapsedTime * 0.4;
    hexLattice.rotation.x = 0.8 + Math.sin(elapsedTime * 1.2) * 0.2;
    hexLattice.rotation.z = Math.cos(elapsedTime * 0.8) * 0.15;

    cleanArchSymbol.position.x = cleanArchSymbol.userData['baseX'] + Math.sin(elapsedTime * 1.4) * 0.6;
    cleanArchSymbol.position.y = cleanArchSymbol.userData['baseY'] + Math.cos(elapsedTime * 1.5) * 0.8;
    cleanArchSymbol.position.z = cleanArchSymbol.userData['baseZ'] + Math.sin(elapsedTime * 1.6) * 0.6;
    cleanArchSymbol.children.forEach((ring, i) => {
        if (ring.name === 'archRing') {
            ring.rotation.z = elapsedTime * 0.8 * (i % 2 === 0 ? -1 : 1);
            ring.rotation.x = Math.PI / 2 + Math.sin(elapsedTime * 2 + i) * 0.35;
        }
    });
    cleanArchSymbol.rotation.y = elapsedTime * 0.5 + (cleanArchSymbol.userData['spinOffset'] || 0);
    const scalePulse = 0.6 + Math.sin(elapsedTime * 3) * 0.05;
    cleanArchSymbol.scale.set(scalePulse, scalePulse, scalePulse);

    aiNode.position.x = aiNode.userData['baseX'] + Math.cos(elapsedTime * 1.5) * 0.5;
    aiNode.position.y = aiNode.userData['baseY'] + Math.sin(elapsedTime * 1.8) * 0.6;
    aiNode.position.z = aiNode.userData['baseZ'] + Math.cos(elapsedTime * 1.7) * 0.5;
    aiNode.rotation.y = elapsedTime * 0.5;
    aiNode.rotation.z = Math.sin(elapsedTime * 2) * 0.25;
    ((aiNode.children[0] as THREE.Mesh).material as THREE.Material).opacity = 0.3 + Math.sin(elapsedTime * 6) * 0.4;

    gitTree.position.x = gitTree.userData['baseX'] + Math.sin(elapsedTime * 1.7) * 0.5;
    gitTree.position.y = gitTree.userData['baseY'] + Math.sin(elapsedTime * 2.0) * 0.6;
    gitTree.position.z = gitTree.userData['baseZ'] + Math.cos(elapsedTime * 1.9) * 0.5;
    gitTree.rotation.y = elapsedTime * 0.5;
    gitTree.rotation.z = Math.sin(elapsedTime * 1.5) * 0.25 + Math.sin(gitTree.userData['rotOffset'] || 0) * 0.4;

    obsidianGraph.position.x = obsidianGraph.userData['baseX'] + Math.cos(elapsedTime * 1.3) * 0.5;
    obsidianGraph.position.y = obsidianGraph.userData['baseY'] + Math.sin(elapsedTime * 1.4) * 0.6;
    obsidianGraph.position.z = obsidianGraph.userData['baseZ'] + Math.sin(elapsedTime * 1.2) * 0.5;
    obsidianGraph.rotation.x = elapsedTime * 0.4 + (obsidianGraph.userData['spinOffset'] || 0);
    obsidianGraph.rotation.y = elapsedTime * 0.5 + (obsidianGraph.userData['spinOffset'] || 0);
    const obsScale = 1 + Math.sin(elapsedTime * 3) * 0.1 + (obsidianGraph.userData['scaleOffset'] || 0);
    obsidianGraph.scale.setScalar(obsScale);
    
    this.renderer.render(this.scene, this.camera);
  }

  public onWindowResize(width: number, height: number) {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public onScroll(scrollP: number) {
    if (!this.models) return;
    const { cyberCat, cleanArchSymbol, dbSymbol, hexLattice: hexagonalSymbol, obsidianGraph, aiNode, gitTree, bgParticles, bgNebulas } = this.models;

    const catZ = scrollP < 0 ? 15 + (scrollP * 120) : 15 - (scrollP * 50);

    gsap.to(cyberCat.userData, { baseX: 8 - (scrollP * 20), baseY: -1 + (scrollP * 10), baseZ: catZ, duration: 1, ease: 'power2.out' });
    gsap.to(cyberCat.rotation, { y: -0.5 + (scrollP * 3), duration: 1, ease: 'power2.out' });

    gsap.to(cleanArchSymbol.userData, { baseX: -12 + (scrollP * 24), baseY: 5 - (scrollP * 30), baseZ: -5 + (scrollP * 105), duration: 1, ease: 'power2.out' });
    gsap.to(dbSymbol.userData, { baseX: -16 + (scrollP * 21), baseY: -12 + (scrollP * 15), baseZ: -50 + (scrollP * 83), duration: 1, ease: 'power2.out' });
    gsap.to(hexagonalSymbol.userData, { baseX: -55 + (scrollP * 90), baseY: -60 + (scrollP * 120), baseZ: -100 + (scrollP * 220), duration: 1, ease: 'power2.out' });
    gsap.to(obsidianGraph.userData, { baseX: 50 - (scrollP * 60), baseY: -40 + (scrollP * 60), baseZ: -90 + (scrollP * 150), duration: 1, ease: 'power2.out' });
    gsap.to(aiNode.userData, { baseX: -30 + (scrollP * 20), baseY: -18 + (scrollP * 18), baseZ: -55 + (scrollP * 70), duration: 1, ease: 'power2.out' });
    gsap.to(gitTree.userData, { baseX: 34 - (scrollP * 20), baseY: -22 + (scrollP * 22), baseZ: -60 + (scrollP * 70), duration: 1, ease: 'power2.out' });
    
    gsap.to(bgParticles.position, { y: scrollP * 30, duration: 0.5, ease: 'power1.out' });
    if (bgNebulas) {
      gsap.to(bgNebulas.position, { y: scrollP * 15, duration: 0.5, ease: 'power1.out' });
      const targetOpacity = scrollP <= 0 ? 0 : 0.8;
      gsap.to(bgNebulas.material, { opacity: targetOpacity, duration: 1, ease: 'power2.out' });
    }
  }

  public onClick(clientX: number, clientY: number) {
    if (!this.models) return;
    this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const intersects = this.raycaster.intersectObjects(this.scene.children, true);
    if (intersects.length === 0) return;

    let object: THREE.Object3D | null = intersects[0].object;
    while (object && object.parent && object.parent !== this.scene) {
      object = object.parent;
    }

    const { cyberCat, cleanArchSymbol, aiNode, gitTree, obsidianGraph, dbSymbol, hexLattice } = this.models;

    if (object === cyberCat) {
      this.animateScaleBounce(cyberCat.getObjectByName('leftEye'), 0.1);
      this.animateScaleBounce(cyberCat.getObjectByName('rightEye'), 0.1);
      this.showFloatingText(cyberCat, "GitHub Cat\nCat Lover UwU", "#d47fe0");
    } else if (object === cleanArchSymbol) {
      this.animateSpin(cleanArchSymbol, Math.PI * 4);
      this.showFloatingText(cleanArchSymbol, "Clean Architecture\nDDD & Hexagonal", "#00ffcc");
    } else if (object === aiNode) {
      this.animateScaleUniform(aiNode, 1.1);
      this.showFloatingText(aiNode, "AI Node\nMachine Learning", "#34d399");
    } else if (object === gitTree) {
      this.animateRotOffset(gitTree, Math.PI * 4);
      this.showFloatingText(gitTree, "Git Tree\nCI/CD Pipelines", "#ff4444");
    } else if (object === obsidianGraph) {
      this.animateSpin(obsidianGraph, Math.PI * 2);
      this.animateScaleOffset(obsidianGraph, 0.5);
      this.showFloatingText(obsidianGraph, "Second Brain\nKnowledge Graph", "#d47fe0");
    } else if (object === dbSymbol) {
      this.animateScaleDistort(dbSymbol, 1.3, 0.6);
      this.showFloatingText(dbSymbol, "Relational DB\nMySQL", "#38bdf8");
    } else if (object === hexLattice) {
      this.animateScaleUniform(hexLattice, 1.4);
      this.showFloatingText(hexLattice, "Hexagonal Architecture\nPorts & Adapters", "#d47fe0");
    }
  }

  private animateScaleBounce(obj: THREE.Object3D | undefined, yTarget: number) {
    if (!obj) return;
    gsap.killTweensOf(obj.scale);
    obj.scale.set(1, 1, 1);
    gsap.to(obj.scale, { y: yTarget, duration: 0.15, yoyo: true, repeat: 1, ease: 'power1.inOut' });
  }

  private animateSpin(group: THREE.Group, offsetTarget: number) {
    gsap.killTweensOf(group.userData, "spinOffset");
    group.userData['spinOffset'] = group.userData['spinOffset'] || 0;
    gsap.to(group.userData, { spinOffset: group.userData['spinOffset'] + offsetTarget, duration: 1.5, ease: 'power3.inOut' });
  }

  private animateScaleUniform(group: THREE.Group, target: number) {
    gsap.killTweensOf(group.scale);
    group.scale.set(1, 1, 1); // Reset (aprox)
    gsap.to(group.scale, { x: target, y: target, z: target, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.out' });
  }

  private animateScaleDistort(group: THREE.Group, yT: number, xzT: number) {
    gsap.killTweensOf(group.scale);
    group.scale.set(0.8, 0.8, 0.8);
    gsap.to(group.scale, { y: yT, x: xzT, z: xzT, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out' });
  }

  private animateRotOffset(group: THREE.Group, offset: number) {
    gsap.killTweensOf(group.userData, "rotOffset");
    group.userData['rotOffset'] = 0;
    gsap.to(group.userData, { rotOffset: offset, duration: 0.6, ease: 'power2.out', onComplete: () => { group.userData['rotOffset'] = 0; } });
  }

  private animateScaleOffset(group: THREE.Group, offset: number) {
    gsap.killTweensOf(group.userData, "scaleOffset");
    group.userData['scaleOffset'] = 0;
    gsap.to(group.userData, { scaleOffset: offset, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.out' });
  }

  private showFloatingText(object: THREE.Object3D, text: string, color: string) {
    const pos = new THREE.Vector3();
    object.getWorldPosition(pos);
    pos.y -= 2.5;
    pos.project(this.camera);

    const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (pos.y * -0.5 + 0.5) * window.innerHeight;

    const label = document.createElement('div');
    label.style.position = 'absolute';
    label.style.left = `${x}px`;
    label.style.top = `${y}px`;
    label.style.transform = 'translate(-50%, -50%) scale(0.5)';
    label.style.color = color;
    label.style.fontFamily = '"Rajdhani", sans-serif';
    label.style.fontWeight = '700';
    label.style.fontSize = '1.4rem';
    label.style.textShadow = `1px 1px 2px rgba(0,0,0,0.9), 0 0 6px ${color}`;
    label.style.pointerEvents = 'none';
    label.style.zIndex = '1000';
    label.style.opacity = '0';
    label.style.textAlign = 'center';

    this.container.appendChild(label);

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>';
    let iterations = 0;
    const scrambleInterval = setInterval(() => {
      label.innerHTML = text.split('').map((char, index) => {
        if (char === '\n') return '<br>';
        if (char === ' ') return ' ';
        if (index < Math.floor(iterations)) return char;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      
      if (iterations >= text.length) {
        clearInterval(scrambleInterval);
        label.innerHTML = text.replace(/\n/g, '<br>');
      }
      iterations += 1.5;
    }, 30);

    gsap.to(label, {
      top: y - 40, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)',
      onComplete: () => { gsap.to(label, { top: y - 80, opacity: 0, scale: 0.8, duration: 0.8, delay: 2.0, ease: 'power2.in', onComplete: () => { label.remove(); } }); }
    });
  }

  public destroy() {
    this.renderer?.dispose();
    Object.values(this.models || {}).forEach(obj => {
        if (obj && typeof obj.traverse === 'function') {
            obj.traverse((child: any) => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) child.material.forEach((m: any) => m.dispose());
                    else child.material.dispose();
                }
            });
        }
            
            if (obj) {
                gsap.killTweensOf(obj);
                gsap.killTweensOf(obj.position);
                gsap.killTweensOf(obj.rotation);
                gsap.killTweensOf(obj.scale);
                gsap.killTweensOf(obj.userData);
            }
    });
    
    if (this.models?.bgNebulas?.material) gsap.killTweensOf(this.models.bgNebulas.material);
    if (this.container) {
        const labels = this.container.querySelectorAll('div');
        if (labels) gsap.killTweensOf(labels);
    }
  }
}