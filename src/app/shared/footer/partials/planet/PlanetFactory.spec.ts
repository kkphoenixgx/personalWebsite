/// <reference types="jasmine" />
import * as THREE from 'three';
import PlanetFactory from './PlanetFactory';
import IPlanet from '../../../../interface/IPlanet';

describe('PlanetFactory (Architectural & Domain Guard)', () => {
  
  it('should create Three.js Meshes based on provided planet data headlessly', () => {
    // Mock do TextureLoader para evitar 404s de imagens nos testes
    spyOn(THREE.TextureLoader.prototype, 'load').and.returnValue(new THREE.Texture());

    const mockScene = new THREE.Scene();
    const spyAdd = spyOn(mockScene, 'add').and.callThrough();

    const planetsData: IPlanet[] = [
      { id: 1, position: [1, 2, 3], imagePath: 'dummy1.png', label: 'Planet Alpha', site: 'site1.com' },
      { id: 2, position: [4, 5, 6], imagePath: 'dummy2.png', label: 'Planet Beta', site: 'site2.com' }
    ];

    const meshes = PlanetFactory.createPlanets(mockScene, planetsData);

    // Validações Estruturais
    expect(meshes.length).toBe(2);
    expect(spyAdd).toHaveBeenCalledTimes(2);

    // Validação de Injeção de Dependência de Dados (UserData)
    expect(meshes[0].userData['id']).toBe(1);
    expect(meshes[0].userData['label']).toBe('Planet Alpha');
    expect(meshes[0].position.x).toBe(1);
  });
});