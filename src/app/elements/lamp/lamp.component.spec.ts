/// <reference types="jasmine" />
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LampComponent } from './lamp.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DarkModeControllerServiceMock } from '../../services/tests/dark-mode-controller.service.mock'; 
import { DarkModeControllerService } from '../../services/dark-mode-controller.service'; // Importe o serviço original
import { Runner, World, Engine, Render, Mouse } from 'matter-js';

describe('LampComponent (Performance & Metrics)', () => {
  let component: LampComponent;
  let fixture: ComponentFixture<LampComponent>;

  const originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

  beforeEach(fakeAsync(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  
    TestBed.configureTestingModule({
      imports: [LampComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{ provide: DarkModeControllerService, useClass: DarkModeControllerServiceMock }]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(LampComponent);
      component = fixture.componentInstance;
  
      fixture.detectChanges();
      tick(); // Avança o tempo para resolver as chamadas assíncronas
    });
  }));

  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout; // Restaura o timeout original
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('[Métrica] should clean up Matter.js engine and memory on destroy to prevent memory leaks', () => {
    const runnerStopSpy = spyOn(Runner, 'stop').and.callThrough();
    const worldClearSpy = spyOn(World, 'clear').and.callThrough();
    const engineClearSpy = spyOn(Engine, 'clear').and.callThrough();
    const renderStopSpy = spyOn(Render, 'stop').and.callThrough();
    const mouseClearSpy = spyOn(Mouse, 'clearSourceEvents').and.callThrough();

    component.ngOnDestroy();

    expect(runnerStopSpy).toHaveBeenCalled();
    expect(worldClearSpy).toHaveBeenCalled();
    expect(engineClearSpy).toHaveBeenCalled();
    expect(renderStopSpy).toHaveBeenCalled();
    expect(mouseClearSpy).toHaveBeenCalled(); // Atesta que o Matter.Mouse limpou o cache global

    expect((component as unknown as { render: unknown }).render).toBeUndefined();
  });

  it('[Métrica] should complete destroy$ subject on ngOnDestroy to prevent RxJS memory leaks', () => {
    const componentWithInternal = component as unknown as { destroy$: { next: jasmine.Spy, complete: jasmine.Spy } };
    const destroyNextSpy = spyOn(componentWithInternal.destroy$, 'next').and.callThrough();
    const destroyCompleteSpy = spyOn(componentWithInternal.destroy$, 'complete').and.callThrough();

    component.ngOnDestroy();

    expect(destroyNextSpy).toHaveBeenCalled();
    expect(destroyCompleteSpy).toHaveBeenCalled();
  });
});
