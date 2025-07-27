import * as THREE from 'three';

class CircularCurve extends THREE.Curve<THREE.Vector3> {
  constructor(private radius: number) {
    super();
  }
  override getPoint(t: number): THREE.Vector3 {
    const angle = t * 2 * Math.PI;
    const x = this.radius * Math.cos(angle);
    const y = this.radius * Math.sin(angle);
    const z = 0; 
    return new THREE.Vector3(x, y, z);
  }
}

export default class ReactPlanet {
  public planet!: THREE.Mesh;
  public pivots: THREE.Object3D[] = [];
  public system!: THREE.Object3D;

  constructor(public scene: THREE.Scene, public position: [number, number, number]) {
    this.initSystem();
  }

  private initSystem() {
    this.system = new THREE.Object3D();
    this.system.position.set(...this.position);

    this.createReactPlanet();
    this.createOrbiters();

    this.system.scale.set(3, 3, 3);

    this.system.rotation.y = -Math.PI / 6;

    this.scene.add(this.system);
  }

  private createReactPlanet() {
    const geometry = new THREE.SphereGeometry(0.2, 64, 64);
    const material = new THREE.MeshStandardMaterial({ color: 'cyan' });
    this.planet = new THREE.Mesh(geometry, material);

    this.planet.userData = {
      id: 9999,
      label: 'React Exercises',
      site: 'https://kkphoenixgx.github.io/react-exercises-site/'
    };

    this.system.add(this.planet);
  }

  private createOrbiters() {
    const orbiterGeometry = new THREE.SphereGeometry(0.03, 16, 16);
    const orbiterMaterial = new THREE.MeshStandardMaterial({
      color: 'cyan',
      emissive: 'cyan',
      emissiveIntensity: 1
    });

    const radius = 0.7;
    const inclinations = [0, Math.PI / 3, -Math.PI / 3];

    for (let i = 0; i < 3; i++) {
      const pivot = new THREE.Object3D();
      pivot.rotateOnAxis(new THREE.Vector3(1, 0, 0), inclinations[i]);

      const orbiter = new THREE.Mesh(orbiterGeometry, orbiterMaterial);
      orbiter.position.set(radius, 0, 0);

      pivot.add(orbiter);
      this.system.add(pivot);
      this.pivots.push(pivot);

      const orbitTrail = this.createOrbitTrail(radius, inclinations[i]);
      this.system.add(orbitTrail);
    }
  }

  private createOrbitTrail(radius: number, inclination: number) {
    const curve = new CircularCurve(radius);
    const geometry = new THREE.TubeGeometry(curve, 64, 0.01, 8, true);
    const material = new THREE.MeshBasicMaterial({
      color: 'cyan',
      transparent: true,
      opacity: 0.4
    });

    const trail = new THREE.Mesh(geometry, material);
    trail.rotateOnAxis(new THREE.Vector3(1, 0, 0), inclination);
    return trail;
  }

  public update() {
    for (let i = 0; i < this.pivots.length; i++) {
      this.pivots[i].rotation.z += 0.02 * (i + 1);
    }
  }

}
