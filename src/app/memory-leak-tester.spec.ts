import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, OnDestroy } from '@angular/core';

// Componente Mock Dummy para exemplificar. No mundo real, você passará o HistoryComponent ou LampComponent
@Component({
  selector: 'app-heavy-3d-mock',
  template: '<canvas id="webgl-canvas"></canvas>'
})
class Heavy3DMockComponent implements OnDestroy {
  // Simula a alocação de buffers pesados na GPU (Ex: THREE.Points, Matter.World)
  heavyArray = new Array(1000000).fill('WebGL Vertex Data Simulation');
  
  ngOnDestroy() {
    // Se o desenvolvedor esquecer de limpar isso (Ex: renderer.dispose()), causará Memory Leak
    this.heavyArray = []; 
  }
}

describe('Telemetry & Hardware Metrics (Garbage Collection)', () => {
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Heavy3DMockComponent]
    }).compileComponents();
  });

  it('[Métrica] [Memória] Componentes pesados (Three.js/Matter.js) NÃO devem deixar sujeira na Heap após ngOnDestroy', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const memoryAPI = (performance as any).memory;
    
    // Se o navegador não for baseado em Chromium, passamos o teste com aviso
    if (!memoryAPI) {
      console.warn('⚠️ Teste de Memory Leak pulado: A API performance.memory só está disponível em navegadores Chromium (V8).');
      expect(true).toBeTrue();
      return;
    }

    // 1. Marca a memória RAM alocada inicialmente
    const initialMemory = memoryAPI.usedJSHeapSize;

    // 2. Instancia o componente pesado
    let fixture: ComponentFixture<Heavy3DMockComponent> | null = TestBed.createComponent(Heavy3DMockComponent);
    fixture.detectChanges();

    // 3. Força a destruição total do componente e do ciclo do Angular
    fixture.destroy();
    fixture = null;

    // 4. Verificamos se a memória restante tem um delta saudável
    const finalMemory = memoryAPI.usedJSHeapSize;
    const deltaMemoryMB = (finalMemory - initialMemory) / 1024 / 1024;
    
    console.log(`\n[Métrica] [Memória] Delta pós-destruição: ${deltaMemoryMB.toFixed(2)} MB.`);
    
    // Tolera um limite de escape natural do framework de 3MB. Acima disso, faltou um "dispose()" em materiais 3D.
    expect(deltaMemoryMB).toBeLessThan(3, '🚨 MEMORY LEAK DETECTADO! O componente não limpou texturas/materiais/física adequadamente no ngOnDestroy!');
  });
});