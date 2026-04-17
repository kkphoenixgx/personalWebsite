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

  it('should show tooltip on mousemove over a planet', fakeAsync(() => {
    // Aguarda a inicialização do Three.js dentro do ngAfterViewChecked
    tick();
    
    const planets = (component as any).planets as THREE.Mesh[];
    expect(planets.length).toBeGreaterThan(0);

    const raycaster = (component as any).raycaster as THREE.Raycaster;
    spyOn(raycaster, 'intersectObjects').and.returnValue([{ object: planets[0] } as any]);

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
    
    const planets = (component as any).planets as THREE.Mesh[];
    const raycaster = (component as any).raycaster as THREE.Raycaster;
    spyOn(raycaster, 'intersectObjects').and.returnValue([{ object: planets[0] } as any]);
    const windowOpenSpy = spyOn(window, 'open').and.stub();

    component.onClick(new MouseEvent('click'));

    const expectedUrl = planets[0].userData['site'];
    expect(windowOpenSpy).toHaveBeenCalledWith(expectedUrl, '_blank');
  }));
});
