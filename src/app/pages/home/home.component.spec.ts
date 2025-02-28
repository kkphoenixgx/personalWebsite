// home.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { AnimationControllerService } from '../../services/animation-controller.service';
import { DarkModeControllerService } from '../../services/dark-mode-controller.service';
import { of } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import gsap from 'gsap';

// Stub do AnimationControllerService com delay reduzido para testes
class AnimationControllerServiceStub {
  public animationDelayInMs = 1000; // Delay menor para os testes
  getAnimationObserbable() {
    return of(false);
  }
}

// Stub do DarkModeControllerService
class DarkModeControllerServiceStub {
  getDarkModeState() {
    return of(false);
  }
}

describe('HomeComponent', () => {
  let originalTimeout: number;
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeAll(() => {
    // Salva o timeout original e define um novo timeout só para essa suíte
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000; // ex.: 10 segundos
  });

  afterAll(() => {
    // Restaura o timeout original após os testes
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  beforeEach(fakeAsync(() => {
    // Stub do gsap.timeline para evitar a execução real de animações (timeline infinito)
    // Agora inclui o método clear, que é chamado no componente
    spyOn(gsap, 'timeline').and.returnValue({
      clear: () => {},
      to: () => {}
    } as any);

    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: AnimationControllerService, useClass: AnimationControllerServiceStub },
        { provide: DarkModeControllerService, useClass: DarkModeControllerServiceStub },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    })
    // Sobrescreve o template para garantir que os elementos com #firstTab e #helloBackground existam
    .overrideTemplate(HomeComponent, `
      <div #firstTab>First Tab</div>
      <div #helloBackground class="background">Hello Background</div>
    `)
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // Avança o tempo para resolver os setTimeouts pendentes
    tick(10);
    flush();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});