/// <reference types="jasmine" />
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, ElementRef, PLATFORM_ID } from '@angular/core';
import { HistoryComponent } from './history.component';
import * as THREE from 'three';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
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
        { provide: AnimationControllerService, useClass: MockAnimationControllerService },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;

    // Mock canvasRef if not present
    if (!component.canvasRef) {
      component.canvasRef = {
        nativeElement: document.createElement('canvas')
      } as ElementRef<HTMLCanvasElement>;
    }

    // Interceptamos o requestAnimationFrame para não causar loops infinitos em testes
    spyOn(window, 'requestAnimationFrame').and.callFake(() => {
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

  interface HistoryInternal {
    initThreeJS(): void;
    animate(): void;
    _renderer: THREE.WebGLRenderer | undefined;
    _particles: THREE.Points | undefined;
    _gridLines: THREE.LineSegments | undefined;
    _scene: THREE.Scene | undefined;
    _isThreeContainerVisible: boolean;
    destroy$: { next: jasmine.Spy, complete: jasmine.Spy };
  }

  it('[Métrica] should clean up ThreeJS memory on destroy to prevent memory leaks', fakeAsync(() => {
    const internal = component as unknown as HistoryInternal;
    internal.initThreeJS();
    tick(600); // Aguarda o timeout interno do initThreeJS

    const renderer = internal._renderer;
    const particles = internal._particles;
    const gridLines = internal._gridLines;

    if (!renderer || !particles || !gridLines) {
      fail('ThreeJS elements not initialized');
      return;
    }

    expect(renderer).toBeDefined();
    expect(particles).toBeDefined();

    const rendererDisposeSpy = spyOn(renderer, 'dispose').and.callThrough();
    const particlesGeoDisposeSpy = spyOn(particles.geometry, 'dispose').and.callThrough();
    const gridGeoDisposeSpy = spyOn(gridLines.geometry, 'dispose').and.callThrough();

    component.ngOnDestroy();

    expect(rendererDisposeSpy).toHaveBeenCalled();
    expect(particlesGeoDisposeSpy).toHaveBeenCalled();
    expect(gridGeoDisposeSpy).toHaveBeenCalled();
    
    expect(internal._renderer).toBeUndefined();
    expect(internal._scene).toBeUndefined();
  }));

  it('[Métrica] should pause rendering when container is not visible (Frame Stability)', fakeAsync(() => {
    const internal = component as unknown as HistoryInternal;
    internal.initThreeJS();
    tick(600);

    const renderer = internal._renderer;
    if (!renderer) {
      fail('Renderer not initialized');
      return;
    }
    const renderSpy = spyOn(renderer, 'render').and.stub();

    // Simula o container fora da tela
    internal._isThreeContainerVisible = false;
    internal.animate(); // Tentativa de frame
    
    expect(renderSpy).not.toHaveBeenCalled();

    // Simula o container visível
    internal._isThreeContainerVisible = true;
    internal.animate(); // Tentativa de frame

    expect(renderSpy).toHaveBeenCalled();
  }));

  it('[Métrica] should complete destroy$ subject on ngOnDestroy to prevent RxJS memory leaks', () => {
    const internal = component as unknown as HistoryInternal;
    const destroyNextSpy = spyOn(internal.destroy$, 'next').and.callThrough();
    const destroyCompleteSpy = spyOn(internal.destroy$, 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(destroyNextSpy).toHaveBeenCalled();
    expect(destroyCompleteSpy).toHaveBeenCalled();
  });

  it('[Métrica] should toggle isGreatingsInEnglish when handleChangeGreatings is called', () => {
    expect(component.isGreatingsInEnglish).toBeFalse();
    component.handleChangeGreatings();
    expect(component.isGreatingsInEnglish).toBeTrue();
    component.handleChangeGreatings();
    expect(component.isGreatingsInEnglish).toBeFalse();
  });
});
