import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { RpgRogueliteBullethellComponent } from './rpg-roguelite-bullethell.component';

describe('RpgRogueliteBullethellComponent', () => {
  let component: RpgRogueliteBullethellComponent;
  let fixture: ComponentFixture<RpgRogueliteBullethellComponent>;

  // Mock do IntersectionObserver
  let intersectionObserverCallback: IntersectionObserverCallback;
  let mockObserver: jasmine.SpyObj<IntersectionObserver>;

  beforeEach(async () => {
    mockObserver = jasmine.createSpyObj('IntersectionObserver', ['observe', 'disconnect', 'unobserve']);
    spyOn(window, 'IntersectionObserver').and.callFake(function(callback: IntersectionObserverCallback) {
      intersectionObserverCallback = callback;
      return mockObserver;
    } as any);

    await TestBed.configureTestingModule({
      imports: [RpgRogueliteBullethellComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: DarkModeControllerService, useValue: { getDarkModeObserbable: () => of(true) } },
        { provide: AnimationControllerService, useValue: { getAnimationObserbable: () => of(true) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RpgRogueliteBullethellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize observables and services correctly', () => {
    expect(component.isDarkMode$).toBeDefined();
    expect(component.isAnimated$).toBeDefined();
    expect(component.darkModeService).toBeDefined();
    expect(component.animationService).toBeDefined();
  });

  it('should initialize IntersectionObserver with correct options and observe all targeted elements', () => {
    // Mata os mutantes de opções do objeto (threshold, rootMargin)
    expect(window.IntersectionObserver).toHaveBeenCalledWith(
      jasmine.any(Function),
      jasmine.objectContaining({ root: null, rootMargin: '0px', threshold: 0.15 })
    );

    // Mata o mutante de string do querySelectorAll ('.reveal-up, .observe-me')
    // O RpgRogueliteBullethellComponent tem exatamente 11 elementos no HTML com essas classes
    expect(mockObserver.observe).toHaveBeenCalledTimes(11);
  });

  it('should add "visible" class when element is intersecting', () => {
    const mockElement = document.createElement('div');
    const entry = {
      isIntersecting: true,
      target: mockElement
    } as unknown as IntersectionObserverEntry;

    intersectionObserverCallback([entry], mockObserver);
    expect(mockElement.classList.contains('visible')).toBeTrue();
  });

  it('should remove "visible" class when element is not intersecting', () => {
    const mockElement = document.createElement('div');
    mockElement.classList.add('visible'); // Configura o estado inicial para true
    const entry = {
      isIntersecting: false,
      target: mockElement
    } as unknown as IntersectionObserverEntry;

    intersectionObserverCallback([entry], mockObserver);
    expect(mockElement.classList.contains('visible')).toBeFalse();
  });

  it('should disconnect and nullify observer on destroy', () => {
    // Cast "any" para acessar propriedades privadas em teste unitário e verificar memory leak
    component.ngOnDestroy();
    expect(mockObserver.disconnect).toHaveBeenCalled();
    expect((component as any).observer).toBeNull();
  });

  it('should not throw error on destroy if observer is already null', () => {
    (component as any).observer = null;
    expect(() => component.ngOnDestroy()).not.toThrowError();
  });
});
