/// <reference types="jasmine" />
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ConfigMenuComponent } from './config-menu.component';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

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
      imports: [ConfigMenuComponent, TranslateModule.forRoot()],
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

  it('[Métrica] should activate and destroy lamp on Dark Mode toggle to prevent memory leaks', fakeAsync(() => {
    expect(component.lampComponentRef).toBeUndefined();
    
    // Simula clique de ligar a lâmpada acionando o toggle de Dark Mode (com animações ativas via Mock)
    component.handleToggleDarkMode();
    tick();
    expect(component.lampComponentRef).toBeDefined();
    
    // Simula clique de desligar (destruir) a lâmpada
    component.handleToggleDarkMode();
    tick();
    expect(component.lampComponentRef).toBeNull();
  }));

  it('deve instanciar a lâmpada ao clicar fisicamente no slider de Dark Mode na UI', fakeAsync(() => {
    expect(component.lampComponentRef).toBeUndefined();
    
    // Busca o input do slider pelo ID como um usuário faria
    const toggleInput = fixture.debugElement.query(By.css('#dark-mode-toggle')).nativeElement;
    
    // Dispara o evento de mudança (click/change)
    toggleInput.dispatchEvent(new Event('change'));
    
    tick(); // Aguarda a promessa do lazy load resolver no background
    fixture.detectChanges();
    
    // Garante que o componente da lâmpada foi criado após a interação na interface
    expect(component.lampComponentRef).toBeDefined();
  }));
});
