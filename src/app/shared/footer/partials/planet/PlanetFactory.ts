import * as THREE from 'three';
import IPlanet from '../../../../interface/IPlanet';

export default class PlanetFactory {

  static createPlanets(scene: THREE.Scene, planetList: IPlanet[]): THREE.Mesh[] {
    const loader = new THREE.TextureLoader();
    const meshes: THREE.Mesh[] = [];

    planetList.forEach(planet => {
      try {
        const geometry = new THREE.SphereGeometry(2, 64, 64);
        const texture = loader.load(planet.imagePath);
        const material = new THREE.MeshStandardMaterial({ map: texture });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(...planet.position);

        mesh.userData = {
          id: planet.id,
          label: planet.label,
          site: planet.site,
          imagePath: planet.imagePath
        };

        scene.add(mesh);
        meshes.push(mesh);
      } catch (e) {
        console.error(`Erro ao criar planeta ${planet.id}`, e);
      }
    });

    return meshes;
  }
}