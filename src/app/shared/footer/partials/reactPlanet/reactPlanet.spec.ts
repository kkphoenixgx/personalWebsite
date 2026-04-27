/// <reference types="jasmine" />
import * as THREE from 'three';
import ReactPlanet from './reactPlanet';

describe('ReactPlanet (Architectural & Domain Guard)', () => {
  
  it('should initialize the React logo complex system without throwing errors', () => {
    const mockScene = new THREE.Scene();
    const reactPlanet = new ReactPlanet(mockScene, [0, 0, 0]);

    expect(reactPlanet.system).toBeDefined();
    expect(reactPlanet.planet).toBeDefined();
    
    // O logo do react deve conter 3 anéis orbitais construídos
    expect(reactPlanet.pivots.length).toBe(3); 
    expect(reactPlanet.planet.userData['label']).toBe('React Exercises');

    // Verifica se a lógica de atualização dos eixos Z não quebra matematicamente
    expect(() => reactPlanet.update()).not.toThrow();
  });
});