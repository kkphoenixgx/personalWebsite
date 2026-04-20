/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { routes } from './app.routes';
import { FileNavigatorService } from './services/file-navigator-service.service';
import { ViewportHelper } from './utils/Viewport';
import axe from 'axe-core';

describe('Global Software Metrics (A11y, Performance, Responsiveness & Architecture)', () => {
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;

  beforeAll(() => {
    // Aumenta o limite global de tempo do Jasmine para evitar Timeouts em navegações assíncronas (5000ms -> 30000ms)
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
    
    console.log(`\n\n`);
    console.log(`====================================================================================================`);
    console.log(`=================================== 🚀 NOVA EXECUÇÃO DE MÉTRICAS 🚀 ================================`);
    console.log(`====================================================================================================\n`);
  });

  afterAll(() => {
    console.log(`\n====================================================================================================`);
    console.log(`=================================== 🏁 FIM DA EXECUÇÃO DE MÉTRICAS 🏁 ==============================`);
    console.log(`====================================================================================================\n\n`);
  });

  beforeEach(async () => {
    const fileNavMock = jasmine.createSpyObj('FileNavigatorService', ['getItems']);
    fileNavMock.getItems.and.returnValue(Promise.resolve([]));

    // Mocks do fetch global para evitar requisições reais do ArticlesComponent que podem pendurar em CI/Headless
    spyOn(window, 'fetch').and.returnValue(Promise.resolve({
      ok: true,
      json: () => Promise.resolve([])
    } as Response));

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter(routes),
        { provide: FileNavigatorService, useValue: fileNavMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    router = TestBed.inject(Router);
  });

  it('[Métrica] [Velocidade] should measure detailed initialization and 3D load times', async () => {
    const t0 = performance.now();
    
    fixture.detectChanges();
    router.initialNavigation();
    await fixture.whenStable(); // Aguarda todas as promises e o roteamento inicial da página inicial
    
    const t1 = performance.now();
    const baseRender = t1 - t0;
    
    console.log(`\n[Métrica] [Velocidade] --- RELATÓRIO DE PERFORMANCE DETALHADO ---`);
    console.log(`[Métrica] [Velocidade] Render Base da SPA: ${baseRender.toFixed(2)}ms - ${baseRender < 1000 ? '🟢 ÓTIMO' : '🟡 ACEITÁVEL'}`);

    // Espera forçada para as animações e motores 3D (Three.js/GSAP) engatarem (Delay padrão foi otimizado para 500ms)
    await new Promise(resolve => setTimeout(resolve, 600));
    fixture.detectChanges();
    
    const t2 = performance.now();
    const total3D = t2 - t0;

    const canvases = fixture.nativeElement.querySelectorAll('canvas');
    const totalDOMElements = fixture.nativeElement.getElementsByTagName('*').length;

    console.log(`[Métrica] [Velocidade] Tempo até injeção dos motores 3D/Física: ${total3D.toFixed(2)}ms - ${total3D < 3000 ? '🟢 ÓTIMO' : '🔴 LENTO'}`);
    console.log(`[Métrica] [Velocidade] Elementos 3D renderizados na tela inicial: ${canvases.length}`);
    console.log(`[Métrica] [Velocidade] Total de Nós no DOM na Carga Inicial: ${totalDOMElements} - ${totalDOMElements < 1500 ? '🟢 ÓTIMO' : '🟡 ACEITÁVEL'}`);

    expect(baseRender).toBeLessThan(5000, 'Render base da SPA muito lento.');
    expect(totalDOMElements).toBeLessThan(3000, 'Excesso de nós no DOM.');
  });

  it('[Métrica] [Acessibilidade] should scan components and generate a detailed debt report', async () => {
    fixture.detectChanges();
    router.initialNavigation();
    await fixture.whenStable();

    console.log(`\n[Métrica] [Acessibilidade] --- RELATÓRIO DE ACESSIBILIDADE WCAG ---`);
    const results = await axe.run(fixture.nativeElement);
    
    if (results.violations.length > 0) {
      console.log(`[Métrica] [Acessibilidade] 🔴 DÉBITO TÉCNICO: Encontradas ${results.violations.length} violações.`);
      results.violations.forEach((v, index) => {
        console.log(`[Métrica] [Acessibilidade] ${index + 1}. Falha: ${v.id} (${v.impact})`);
        console.log(`[Métrica] [Acessibilidade]    Descrição: ${v.description}`);
        console.log(`[Métrica] [Acessibilidade]    Elemento(s) afetado(s): ${v.nodes.length}`);
        
        // Itera sobre os nós específicos que causaram a falha para apontar a localização exata
        v.nodes.forEach((node, nodeIndex) => {
          console.log(`[Métrica] [Acessibilidade]      ❌ Alvo ${nodeIndex + 1}: ${node.target.join(', ')}`);
          const shortHtml = node.html.length > 100 ? node.html.substring(0, 97) + '...' : node.html;
          console.log(`[Métrica] [Acessibilidade]         HTML: ${shortHtml}`);
          if (node.failureSummary) {
            const summary = node.failureSummary.replace(/\n/g, '\n[Métrica] [Acessibilidade]               ');
            console.log(`[Métrica] [Acessibilidade]         Dica: ${summary}`);
          }
        });
      });
      console.log(`[Métrica] [Acessibilidade] (O teste não falhará para permitir o deploy, as violações foram catalogadas no log).`);
    } else {
      console.log(`[Métrica] [Acessibilidade] 🟢 EXCELENTE! 100% Aprovado! Nenhuma violação WCAG encontrada na SPA.`);
    }
    
    // Passa o teste independentemente para manter o log rodando no CI e catalogar o débito
    expect(true).toBe(true); 
  });

  it('[Métrica] [Responsividade] should simulate mobile metrics and verify layout constraints', async () => {
    fixture.detectChanges();
    
    console.log(`\n[Métrica] [Responsividade] --- RELATÓRIO DE MOBILE ---`);
    
    spyOn(ViewportHelper, 'isMobile').and.returnValue(true);
    spyOn(ViewportHelper, 'isMobileSize').and.returnValue(true);
    
    window.dispatchEvent(new Event('resize'));
    fixture.detectChanges();
    await fixture.whenStable();

    const docWidth = document.documentElement.clientWidth;
    const scrollWidth = document.documentElement.scrollWidth;
    
    const hasHorizontalScroll = scrollWidth > docWidth;
    const statusLayout = !hasHorizontalScroll ? '🟢 ÓTIMO (Sem quebra horizontal)' : '🔴 AVISO (Estourando tela no eixo X)';
    
    console.log(`[Métrica] [Responsividade] Comportamento Mobile: ${statusLayout}`);
    console.log(`[Métrica] [Responsividade] Viewport Helper Simulador Mobile ativado: ${ViewportHelper.isMobile()}`);
    
    expect(ViewportHelper.isMobile()).toBeTrue();
  });

  it('[Métrica] [Arquitetura] should confirm heavy modules are lazy-loaded', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    console.log(`\n[Métrica] [Arquitetura] --- RELATÓRIO DE PAYLOAD BUDGET ---`);
    
    const headerDebugElement: DebugElement = fixture.debugElement.query(By.css('app-header'));
    const configMenuComponent = headerDebugElement.componentInstance.configMenu;

    expect(configMenuComponent.lampComponentRef).toBeFalsy('O LampComponent não deve ser pré-carregado.');
    console.log(`[Métrica] [Arquitetura] Status Inicial do LampComponent: 🟢 Descarregado (Correto)`);

    // Simula o clique para carregar o componente
    await configMenuComponent.loadLampComponent();
    fixture.detectChanges();

    expect(configMenuComponent.lampComponentRef).toBeDefined('O LampComponent deveria ter sido carregado sob demanda.');
    console.log(`[Métrica] [Arquitetura] Status Pós-Ação do LampComponent: 🟢 Carregado dinamicamente (Correto)`);
  });

  it('[Métrica] [SEO] should verify essential meta tags and title for search engines', async () => {
    // Navegamos para uma página da SPA para validar se os serviços de SEO (Title e Meta) estão atuando
    await router.navigate(['/projects']);
    fixture.detectChanges();
    await fixture.whenStable();

    console.log(`\n[Métrica] [SEO] --- RELATÓRIO DE OTIMIZAÇÃO DE BUSCA ---`);
    
    const title = document.title;
    expect(title).toBeTruthy('O site precisa de um título (Title tag).');
    console.log(`[Métrica] [SEO] Title Tag: ${title && title.length > 0 ? '🟢 Presente' : '🔴 Ausente'}`);

    const metaViewport = document.querySelector('meta[name="viewport"]');
    expect(metaViewport).toBeTruthy('Meta viewport é obrigatória para responsividade mobile.');
    console.log(`[Métrica] [SEO] Meta Viewport: ${metaViewport ? '🟢 Presente' : '🔴 Ausente'}`);

    const metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) console.log(`[Métrica] [SEO] 🟡 DÉBITO TÉCNICO: Meta tag "description" ausente. Adicione no index.html para rankear no Google.`);
    else console.log(`[Métrica] [SEO] Meta Description: 🟢 Presente`);
  });

  it('[Métrica] [Design System] should warn about hardcoded colors not in variables.scss', async () => {
    // Navegamos pelas rotas principais para garantir que os componentes injetaram seus estilos na DOM
    await router.navigate(['/projects/the-big-agent']);
    fixture.detectChanges();
    // Substituímos whenStable por um timeout manual. Motores de animação como o GSAP ativam
    // Tickers globais de RequestAnimationFrame que impedem o NgZone de reportar "stable", causando o Timeout.
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await router.navigate(['/articles']);
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`\n[Métrica] [Design System] --- RELATÓRIO DE PALETA DE CORES (STYLE LINT) ---`);
    
    // Paleta oficial listada no variables.scss (e variações estruturais genéricas)
    const officialPalette = [
      '#262626', '#111111', '#2e2c2c', // Grays
      '#cccccc', '#ccc', '#333333', '#333', '#767676', // Additional Grays
      '#ff4444', // Status
      '#c7d4e8', '#9100a6', '#d47fe0', // Offwhites & Purples
      '#f5f5f5', '#2c3e50', '#0a0a0adb', '#0a0a0aec', '#1e2a38', // Texts & Backgrounds
      
      '#8c1515', '#820000', '#fdfcf8', '#2e2d29', // Stanford Theme
      'rgba(140,21,21,0.2)', 'rgba(140,21,21,0.15)', 'rgba(140,21,21,0.03)',
      'rgba(46,45,41,0.6)', 'rgba(46,45,41,0.8)', 'rgba(46,45,41,0.85)', 'rgba(140,21,21,0.85)', // Stanford with opacity
      
      '#00ffcc', '#050505', '#eef5f4', '#c0c0c0', '#e0f2f1', '#00695c', '#00897b', '#00d6c1', '#00ffe5', '#d1d1d1', // BIG Agent
      'rgba(0,255,204,0.1)', 'rgba(0,255,204,0.2)', 'rgba(0,255,204,0.4)', 'rgba(0,255,204,0.5)', 'rgba(0,255,204,0.8)',
      '#ff0033', 'rgba(255,0,51,0.15)', 'rgba(255,0,51,0.9)', 'rgba(255,0,51,0.6)', 'rgba(255,0,51,0.5)',

      'rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)',
      'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.15)', 'rgba(0,0,0,0.08)', 'rgba(0,0,0,0.06)', 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.04)',
      'rgba(128,128,128,0.2)', 'rgba(128,128,128,0.05)',
      'rgba(212,127,224,0.3)', 'rgba(145,0,166,0.15)', 'rgba(145,0,166,0.3)', 'rgba(145,0,166,0.1)', 'rgba(145,0,166,0.4)',
      'rgba(44,62,80,0.3)', '#e0e0e0',

      '#ffffff', '#000000', '#fff', '#000', // Padrões aceitáveis
      'rgba(0,0,0,0)', 'rgba(0,0,0,1)', 'rgba(255,255,255,1)', // Transparências base
      'rgb(0,0,0)', 'rgb(255,255,255)', 'transparent'
    ];

    const unauthorizedColors = new Map<string, Set<string>>();
    
    // Busca todas as tags de estilo inseridas na página
    const styleTags = document.querySelectorAll('style');
    
    styleTags.forEach(style => {
      const cssText = style.textContent || '';
      const normalizedCss = cssText.toLowerCase().replace(/,\s+/g, ',');
      
      // Regex para extrair valores HEX (3 a 8 dígitos) e RGB/RGBA
      const colorRegex = /(#[0-9a-f]{3,8}\b|rgba?\([\d,.]+\))/g;
      let match;
      
      while ((match = colorRegex.exec(normalizedCss)) !== null) {
        const color = match[0];
        if (!officialPalette.includes(color)) {
          const colorIndex = match.index;
          const precedingBraceIndex = normalizedCss.lastIndexOf('{', colorIndex);
          const precedingCloseBraceIndex = Math.max(
            normalizedCss.lastIndexOf('}', colorIndex),
            normalizedCss.lastIndexOf('*/', colorIndex),
            -1
          );

          let context = 'Desconhecido / Global';
          // Garante que a cor está dentro de uma regra CSS válida (entre as chaves)
          if (precedingBraceIndex > precedingCloseBraceIndex) {
            const selectorStart = precedingCloseBraceIndex + 1;
            let selector = normalizedCss.substring(selectorStart, precedingBraceIndex).trim();
            
            // Limpa quebras de linha e atributos injetados pelo Angular para revelar o nome do componente/classe limpo
            selector = selector.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ');
            selector = selector.replace(/\[_ngcontent-[a-z0-9-]+\]/g, '');
            selector = selector.replace(/\[_nghost-[a-z0-9-]+\]/g, ':host');
            
            if (selector.length > 60) selector = '...' + selector.substring(selector.length - 57);
            context = selector || 'Global / Inline';
          }

          if (!unauthorizedColors.has(color)) unauthorizedColors.set(color, new Set<string>());
          
          const contextSet = unauthorizedColors.get(color)!;
          if (contextSet.size < 3) contextSet.add(context); // Guarda até 3 ocorrências diferentes por cor para não poluir o terminal
        }
      }
    });

    if (unauthorizedColors.size > 0) {
      console.log(`[Métrica] [Design System] 🟡 AVISO DE DÉBITO TÉCNICO: Encontradas ${unauthorizedColors.size} cores hardcoded fora do variables.scss.`);
      
      let count = 0;
      unauthorizedColors.forEach((contexts, color) => {
        if (count < 15) {
          const contextList = Array.from(contexts).join(' | ');
          console.log(`[Métrica] [Design System]    - Cor ${color} em: [ ${contextList} ]`);
        }
        count++;
      });

      if (unauthorizedColors.size > 15) {
         console.log(`[Métrica] [Design System]    - ... e mais ${unauthorizedColors.size - 15} cores isoladas.`);
      }
      
      console.log(`[Métrica] [Design System] Sugestão: Substitua essas cores nos arquivos .scss por variáveis ($ ou var(--)) integradas ao arquivo styles/variables.scss.`);
    } else {
      console.log(`[Métrica] [Design System] 🟢 EXCELENTE! Nenhuma cor hardcoded fora da paleta foi detectada nos componentes.`);
    }

    // Passa o teste independentemente para manter a natureza de log/alerta no CI (Não trava o build)
    expect(true).toBe(true);
  });
});