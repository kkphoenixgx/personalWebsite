import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Renderer2 } from '@angular/core';
import { LampComponent } from './lamp.component';
import { DarkModeControllerService } from '../../services/dark-mode-controller.service'; 
import { Text3dService } from '../../services/text3d.service.service'; 

describe('LampComponent', () => {
  let component: LampComponent;
  let fixture: ComponentFixture<LampComponent>;
  let darkModeService: DarkModeControllerService;
  let text3dService: Text3dService;
  let renderer: Renderer2;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LampComponent],
      providers: [DarkModeControllerService, Text3dService, Renderer2]
    }).compileComponents();

    fixture = TestBed.createComponent(LampComponent);
    component = fixture.componentInstance;
    darkModeService = TestBed.inject(DarkModeControllerService);
    text3dService = TestBed.inject(Text3dService);
    renderer = TestBed.inject(Renderer2);
  });

  it('deve medir o impacto do componente na performance', () => {
    if ('memory' in performance) {
      console.log((performance as any).memory);
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      component.ngOnInit();
      fixture.detectChanges();
      const afterMemory = (performance as any).memory?.usedJSHeapSize || 0;
      console.log(`Uso de memória inicial: ${initialMemory}, após carregamento: ${afterMemory}`);
      expect(afterMemory - initialMemory).toBeLessThan(50 * 1024 * 1024); // Menos de 50MB
    } else {
      console.log("API de memória não suportada.");
    }
  });

  it('deve verificar se o componente carrega corretamente', () => {
    expect(component).toBeTruthy();
  });

  it('deve medir o tempo de carregamento', (done) => {
    const start = performance.now();
    component.ngOnInit();
    fixture.detectChanges();
    const end = performance.now();
    const loadTime = end - start;
    console.log(`Tempo de carregamento: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(500); // Menos de 500ms
    done();
  });
});
