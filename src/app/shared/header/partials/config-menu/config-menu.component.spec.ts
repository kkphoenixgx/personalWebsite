/// <reference types="jasmine" />
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { ConfigMenuComponent } from './config-menu.component';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { of } from 'rxjs';

class MockAnimationControllerService {
  getAnimationObserbable() { return of(true); }
  setAnimations() {}
}

class MockDarkModeControllerService {
  getDarkModeObserbable() { return of(true); }
  setDarkMode() {}
}

describe('ConfigMenuComponent (Performance & Metrics)', () => {
  let component: ConfigMenuComponent;
  let fixture: ComponentFixture<ConfigMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigMenuComponent],
      providers: [
        { provide: AnimationControllerService, useClass: MockAnimationControllerService },
        { provide: DarkModeControllerService, useClass: MockDarkModeControllerService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('[Métrica] should lazy load LampComponent only when requested (Payload Budget)', fakeAsync(() => {
    expect(component.lampComponentRef).toBeUndefined();
    
    component.loadLampComponent();
    tick(); // Aguarda o dynamic import assíncrono resolver
    
    expect(component.lampComponentRef).toBeDefined();
    
    component.destroyLampComponent();
    expect(component.lampComponentRef).toBeFalsy();
  }));
});
