/// <reference types="jasmine" />
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HistoryComponent } from './history.component';
import * as THREE from 'three';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { of } from 'rxjs';

class MockAnimationControllerService {
  getAnimationObserbable() { return of(true); }
}

describe('HistoryComponent (Performance & Metrics)', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryComponent],
      providers: [
        { provide: AnimationControllerService, useClass: MockAnimationControllerService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;

    // Interceptamos o requestAnimationFrame para não causar loops infinitos em testes
    spyOn(window, 'requestAnimationFrame').and.callFake((cb: FrameRequestCallback) => {
      return 1;
    });

    fixture.detectChanges();
  });
  
  afterEach(() => {
    component.ngOnDestroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('[Métrica] should clean up ThreeJS memory on destroy to prevent memory leaks', fakeAsync(() => {
    component.initThreeJS();
    tick(600); // Aguarda o timeout interno do initThreeJS

    const renderer = (component as any)._renderer as THREE.WebGLRenderer;
    const particles = (component as any)._particles as THREE.Points;
    const gridLines = (component as any)._gridLines as THREE.LineSegments;

    expect(renderer).toBeDefined();
    expect(particles).toBeDefined();

    const rendererDisposeSpy = spyOn(renderer, 'dispose').and.callThrough();
    const particlesGeoDisposeSpy = spyOn(particles.geometry, 'dispose').and.callThrough();
    const gridGeoDisposeSpy = spyOn(gridLines.geometry, 'dispose').and.callThrough();

    component.ngOnDestroy();

    expect(rendererDisposeSpy).toHaveBeenCalled();
    expect(particlesGeoDisposeSpy).toHaveBeenCalled();
    expect(gridGeoDisposeSpy).toHaveBeenCalled();
    
    expect((component as any)._renderer).toBeUndefined();
    expect((component as any)._scene).toBeUndefined();
  }));

  it('[Métrica] should pause rendering when container is not visible (Frame Stability)', fakeAsync(() => {
    component.initThreeJS();
    tick(600);

    const renderer = (component as any)._renderer as THREE.WebGLRenderer;
    const renderSpy = spyOn(renderer, 'render').and.stub();

    // Simula o container fora da tela
    (component as any)._isThreeContainerVisible = false;
    (component as any).animateLoop(); // Tentativa de frame
    
    expect(renderSpy).not.toHaveBeenCalled();

    // Simula o container visível
    (component as any)._isThreeContainerVisible = true;
    (component as any).animateLoop(); // Tentativa de frame

    expect(renderSpy).toHaveBeenCalled();
  }));

  it('[Métrica] should complete destroy$ subject on ngOnDestroy to prevent RxJS memory leaks', () => {
    const destroyNextSpy = spyOn((component as any).destroy$, 'next').and.callThrough();
    const destroyCompleteSpy = spyOn((component as any).destroy$, 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(destroyNextSpy).toHaveBeenCalled();
    expect(destroyCompleteSpy).toHaveBeenCalled();
  });
});
