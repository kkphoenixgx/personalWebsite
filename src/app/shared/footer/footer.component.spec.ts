/// <reference types="jasmine" />
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FooterComponent } from './footer.component';
import { AnimationControllerService } from '../../services/animation-controller.service';
import { DarkModeControllerService } from '../../services/dark-mode-controller.service';
import { of } from 'rxjs';
import * as THREE from 'three';

class MockAnimationControllerService {
  animationDelayInMs = 0;
  getAnimationObserbable() { return of(true); }
}

class MockDarkModeControllerService {
  getDarkModeObserbable() { return of(true); }
}

describe('FooterComponent (DOM Events & Raycasting)', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterComponent],
      providers: [
        { provide: AnimationControllerService, useClass: MockAnimationControllerService },
        { provide: DarkModeControllerService, useClass: MockDarkModeControllerService },
      ]
    }).compileComponents();

    // Mock do TextureLoader para evitar 404s de imagens nos testes
    spyOn(THREE.TextureLoader.prototype, 'load').and.returnValue(new THREE.Texture());

    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    // Forçamos a animação para que o Three.js seja inicializado
    component.isAnimating = true;
    component.loading = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  interface FooterInternal {
    planets: THREE.Mesh[];
    raycaster: THREE.Raycaster;
  }

  it('should show tooltip on mousemove over a planet', fakeAsync(() => {
    // Aguarda a inicialização do Three.js dentro do ngAfterViewChecked
    tick();
    
    const internal = component as unknown as FooterInternal;
    const planets = internal.planets;
    expect(planets.length).toBeGreaterThan(0);

    const raycaster = internal.raycaster;
    spyOn(raycaster, 'intersectObjects').and.returnValue([{ object: planets[0] } as unknown as THREE.Intersection]);

    const mockMouseEvent = new MouseEvent('mousemove', { clientX: 150, clientY: 200 });
    component.onMouseMove(mockMouseEvent);
    fixture.detectChanges();

    expect(component.tooltipVisible).toBe(true);
    expect(component.tooltipText).toBe(planets[0].userData['label']);
    expect(component.tooltipX).toBe(160); // 150 + 10
    expect(component.tooltipY).toBe(210); // 200 + 10
  }));

  it('should open a new window on click over a planet with a valid site', fakeAsync(() => {
    tick();
    
    const internal = component as unknown as FooterInternal;
    const planets = internal.planets;
    const raycaster = internal.raycaster;
    spyOn(raycaster, 'intersectObjects').and.returnValue([{ object: planets[0] } as unknown as THREE.Intersection]);
    const windowOpenSpy = spyOn(window, 'open').and.stub();

    component.onClick(new MouseEvent('click'));

    const expectedUrl = planets[0].userData['site'];
    expect(windowOpenSpy).toHaveBeenCalledWith(expectedUrl, '_blank');
  }));
});
