import * as THREE from 'three';

export interface HelloModels {
  bgParticles: THREE.Points;
  bgNebulas: THREE.Points;
  cyberCat: THREE.Group;
  catMatSolid: THREE.MeshBasicMaterial;
  catMatWire: THREE.MeshBasicMaterial;
  catMatPoints: THREE.PointsMaterial;
  dbSymbol: THREE.Group;
  hexLattice: THREE.Group;
  aiNode: THREE.Group;
  cleanArchSymbol: THREE.Group;
  gitTree: THREE.Group;
  obsidianGraph: THREE.Group;
}

export class HelloModelsFactory {
  static createAllModels(isDarkMode: boolean): HelloModels {
    const { bgParticles, bgNebulas } = this.createBackground(isDarkMode);
    const { cyberCat, catMatSolid, catMatWire, catMatPoints } = this.createCyberCat(isDarkMode);
    
    return {
      bgParticles,
      bgNebulas,
      cyberCat,
      catMatSolid,
      catMatWire,
      catMatPoints,
      dbSymbol: this.createDatabaseSymbol(),
      hexLattice: this.createHexLattice(),
      aiNode: this.createAiNode(),
      cleanArchSymbol: this.createCleanArchSymbol(),
      gitTree: this.createGitTree(),
      obsidianGraph: this.createObsidianGraph()
    };
  }

  private static createBackground(isDarkMode: boolean) {
    // Particles
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

    const bgGeo = new THREE.BufferGeometry();
    const bgCount = 1500;
    const bgPos = new Float32Array(bgCount * 3);
    for(let i = 0; i < bgCount * 3; i++) {
      bgPos[i] = (Math.random() - 0.5) * 120; // 🚀 Mantendo mais coesos
    }
    bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
    const bgMat = new THREE.PointsMaterial({ 
      color: isDarkMode ? 0x38bdf8 : 0x0284c7, size: 0.4, map: particleTexture, transparent: true, depthWrite: false, opacity: 0.6, blending: THREE.AdditiveBlending 
    });
    const bgParticles = new THREE.Points(bgGeo, bgMat);

    // Nebulas
    const nebulaCanvas = document.createElement('canvas');
    nebulaCanvas.width = 128; nebulaCanvas.height = 128;
    const nebulaCtx = nebulaCanvas.getContext('2d')!;
    const nebulaGradient = nebulaCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    nebulaGradient.addColorStop(0, 'rgba(255,255,255,0.6)');
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
      nebulaPos[i+2] = (Math.random() - 0.5) * 80 - 30; // Nuvens bem posicionadas no fundo
    }
    nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPos, 3));
    const nebulaMat = new THREE.PointsMaterial({
      color: 0x7e22ce, size: 80, map: nebulaTexture, transparent: true, depthWrite: false, opacity: 0, blending: THREE.NormalBlending
    });
    const bgNebulas = new THREE.Points(nebulaGeo, nebulaMat);
    bgNebulas.visible = !isDarkMode;

    return { bgParticles, bgNebulas };
  }

  private static createCyberCat(isDarkMode: boolean) {
    const cyberCat = new THREE.Group();
    const pos: number[] = [];
    const addTri = (v1: number[], v2: number[], v3: number[]) => pos.push(...v1, ...v2, ...v3);

    const n = [0, -0.5, 0.8]; const b = [0, 0.2, 0.9]; const el = [-0.7, 0.5, 0.6]; const er = [0.7, 0.5, 0.6];  
    const etl = [-1.5, 2.2, 0]; const etr = [1.5, 2.2, 0]; const ebol = [-2.0, 0.5, -0.2]; const ebor = [2.0, 0.5, -0.2];  
    const ebil = [-0.8, 1.4, 0.2]; const ebir = [0.8, 1.4, 0.2]; const ht = [0, 1.5, 0.3]; const cl = [-1.4, -0.5, 0.2]; 
    const cr = [1.4, -0.5, 0.2]; const j = [0, -1.2, 0.3]; 

    addTri(b, el, n); addTri(b, n, er); addTri(ht, el, b); addTri(ht, b, er);
    addTri(ht, ebil, el); addTri(ht, er, ebir); addTri(etl, ebol, ebil); addTri(etr, ebir, ebor);
    addTri(ebil, ebol, el); addTri(ebir, er, ebor); addTri(el, ebol, cl); addTri(er, cr, ebor);
    addTri(el, cl, n); addTri(er, n, cr); addTri(n, cl, j); addTri(n, j, cr);

    const catGeo = new THREE.BufferGeometry();
    catGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    catGeo.computeVertexNormals();

    const catMatSolid = new THREE.MeshBasicMaterial({ color: isDarkMode ? 0x050810 : 0xfdfcf8, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1 });
    const catMatWire = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending });
    const catMatPoints = new THREE.PointsMaterial({ color: 0xd47fe0, size: 0.15, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });

    cyberCat.add(new THREE.Mesh(catGeo, catMatSolid));
    cyberCat.add(new THREE.Mesh(catGeo, catMatWire));
    cyberCat.add(new THREE.Points(catGeo, catMatPoints));

    const whiskerPos = [ -1.4,-0.2,0.2, -3.0,0.0,0.1, -1.4,-0.4,0.2, -3.2,-0.5,0.2, -1.4,-0.6,0.2, -2.8,-1.0,0.3, 1.4,-0.2,0.2, 3.0,0.0,0.1, 1.4,-0.4,0.2, 3.2,-0.5,0.2, 1.4,-0.6,0.2, 2.8,-1.0,0.3 ];
    const whiskerGeo = new THREE.BufferGeometry();
    whiskerGeo.setAttribute('position', new THREE.Float32BufferAttribute(whiskerPos, 3));
    const whiskerMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
    cyberCat.add(new THREE.LineSegments(whiskerGeo, whiskerMat));

    const eyeGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x9f12a6 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat); leftEye.position.set(-0.7, 0.45, 0.65); leftEye.name = 'leftEye';
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat); rightEye.position.set(0.7, 0.45, 0.65); rightEye.name = 'rightEye';
    cyberCat.add(leftEye); cyberCat.add(rightEye);

    cyberCat.position.set(8, -1, 15); // Gato restaurado no lugar correto
    cyberCat.userData = { baseX: 8, baseY: -1, baseZ: 15 };
    cyberCat.rotation.set(0.2, -0.5, 0.1);
    cyberCat.scale.set(0.8, 0.8, 0.8);

    return { cyberCat, catMatSolid, catMatWire, catMatPoints };
  }

  private static createDatabaseSymbol() {
    const dbSymbol = new THREE.Group();
    const dbMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
    const dbCylinderGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 24, 1, true);
    const dbCylinder = new THREE.Mesh(dbCylinderGeo, dbMat);
    dbSymbol.add(dbCylinder);
    for (let i = 0; i < 2; i++) {
        const dbCylinderMore = new THREE.Mesh(dbCylinderGeo, dbMat);
        dbCylinderMore.position.y = 0.7 * (i + 1);
        dbSymbol.add(dbCylinderMore);
    }
    const hitGeo = new THREE.SphereGeometry(3.0, 16, 16);
    const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    dbSymbol.add(new THREE.Mesh(hitGeo, hitMat));

    dbSymbol.position.set(-30, -10, -50);
    dbSymbol.userData = { baseX: -30, baseY: -10, baseZ: -50 };
    dbSymbol.scale.set(0.8, 0.8, 0.8);
    dbSymbol.rotation.set(0.4, 0.5, 0);
    return dbSymbol;
  }

  private static createHexLattice() {
    const hexLattice = new THREE.Group();
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
            hexLattice.add(hex);
        }
    }
    const hitGeo = new THREE.SphereGeometry(3.5, 16, 16);
    const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    hexLattice.add(new THREE.Mesh(hitGeo, hitMat));

    hexLattice.position.set(80, -20, -120);
    hexLattice.userData = { baseX: 80, baseY: -20, baseZ: -120 };
    hexLattice.rotation.set(0.5, 0, 0.2);
    return hexLattice;
  }

  private static createAiNode() {
    const aiNode = new THREE.Group();
    const nodeCoreGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const nodeCoreMat = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
    const nodeCore = new THREE.Mesh(nodeCoreGeo, nodeCoreMat);
    aiNode.add(nodeCore);
    const connections: number[] = [0,0,0, 4,2,1, 0,0,0, -4,3,-2, 0,0,0, 3,-3,1, 0,0,0, -2,-2,-2, 0,0,0, 5,0,0];
    const nodeLinesGeo = new THREE.BufferGeometry();
    nodeLinesGeo.setAttribute('position', new THREE.Float32BufferAttribute(connections, 3));
    const nodeLinesMat = new THREE.LineBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
    aiNode.add(new THREE.LineSegments(nodeLinesGeo, nodeLinesMat));
    
    aiNode.position.set(-34, -18, -60); 
    aiNode.userData = { baseX: -34, baseY: -18, baseZ: -60 };
    aiNode.scale.set(0.7, 0.7, 0.7);
    return aiNode;
  }

  private static createCleanArchSymbol() {
    const cleanArchSymbol = new THREE.Group();
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, wireframe: true, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
    for (let i = 1; i <= 4; i++) {
        const ringGeo = new THREE.TorusGeometry(i * 1.2, 0.05, 8, 48);
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.name = 'archRing';
        cleanArchSymbol.add(ring);
    }
    const hitGeo = new THREE.SphereGeometry(5.0, 16, 16);
    const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    cleanArchSymbol.add(new THREE.Mesh(hitGeo, hitMat));

    cleanArchSymbol.position.set(-18, 8, -25); 
    cleanArchSymbol.userData = { baseX: -18, baseY: 8, baseZ: -25 };
    cleanArchSymbol.scale.set(0.6, 0.6, 0.6);
    return cleanArchSymbol;
  }

  private static createGitTree() {
    const gitTree = new THREE.Group();
    const gitNodeGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const gitNodeMat = new THREE.MeshBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending });
    const lineMat = new THREE.LineBasicMaterial({ color: 0xff4444, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
    
    const nodes = [ [0, 0, 0], [0, 2, 0], [0, 4, 0], [2, 1, 0], [2, 3, 0] ]; 
    nodes.forEach(pos => {
      const node = new THREE.Mesh(gitNodeGeo, gitNodeMat);
      node.position.set(pos[0], pos[1], pos[2]);
      gitTree.add(node);
    });
    
    const edges = [ 0,0,0, 0,2,0,  0,2,0, 0,4,0,  0,0,0, 2,1,0,  2,1,0, 2,3,0,  2,3,0, 0,4,0 ];
    const gitEdgesGeo = new THREE.BufferGeometry();
    gitEdgesGeo.setAttribute('position', new THREE.Float32BufferAttribute(edges, 3));
    gitTree.add(new THREE.LineSegments(gitEdgesGeo, lineMat));
    
    gitTree.position.set(34, -22, -60); 
    gitTree.userData = { baseX: 34, baseY: -22, baseZ: -60 };
    return gitTree;
  }

  private static createObsidianGraph() {
    const obsidianGraph = new THREE.Group();
    const obsNodeGeo = new THREE.OctahedronGeometry(0.4, 0);
    const obsNodeMat = new THREE.MeshBasicMaterial({ color: 0xd47fe0, wireframe: true, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
    const obsLineMat = new THREE.LineBasicMaterial({ color: 0xd47fe0, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending });
    
    const obsNodes: number[] = [];
    for(let i=0; i<15; i++) obsNodes.push((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
    for(let i=0; i<obsNodes.length; i+=3) {
      const node = new THREE.Mesh(obsNodeGeo, obsNodeMat);
      node.position.set(obsNodes[i], obsNodes[i+1], obsNodes[i+2]);
      obsidianGraph.add(node);
    }
    
    const obsEdges: number[] = [];
    for(let i=0; i<obsNodes.length; i+=3) {
      for(let j=i+3; j<obsNodes.length; j+=3) {
        if (Math.random() > 0.75) obsEdges.push(obsNodes[i], obsNodes[i+1], obsNodes[i+2], obsNodes[j], obsNodes[j+1], obsNodes[j+2]);
      }
    }
    const obsEdgesGeo = new THREE.BufferGeometry();
    obsEdgesGeo.setAttribute('position', new THREE.Float32BufferAttribute(obsEdges, 3));
    obsidianGraph.add(new THREE.LineSegments(obsEdgesGeo, obsLineMat));

    const hitGeo = new THREE.SphereGeometry(4.5, 16, 16);
    const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    obsidianGraph.add(new THREE.Mesh(hitGeo, hitMat));

    obsidianGraph.position.set(40, -20, -80); 
    obsidianGraph.userData = { baseX: 40, baseY: -20, baseZ: -80 };
    return obsidianGraph;
  }
}