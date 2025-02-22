import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { LampComponent } from './lamp.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DarkModeControllerServiceMock } from '../../services/tests/dark-mode-controller.service.mock'; 
import { DarkModeControllerService } from '../../services/dark-mode-controller.service'; // Importe o serviço original

describe('LampComponent', () => {
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
});
