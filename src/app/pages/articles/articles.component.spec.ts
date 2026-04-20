/// <reference types="jasmine" />
import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ArticlesComponent, IArticle } from './articles.component';
import { PdfExtractionService } from '../../services/pdf-extraction.service'; // Removido importação de RouterModule.
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';

describe('ArticlesComponent', () => {
  let component: ArticlesComponent;
  let fixture: ComponentFixture<ArticlesComponent>;
  let mockPdfService: jasmine.SpyObj<PdfExtractionService>;
  let mockActivatedRoute: any;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    // 1. Mock do serviço de extração de PDF
    mockPdfService = jasmine.createSpyObj('PdfExtractionService', ['renderPdfToImages']);

    // 2. Mock do IntersectionObserver (evita erros em ambientes Headless)
    const mockIntersectionObserver = jasmine.createSpyObj('IntersectionObserver', ['observe', 'unobserve', 'disconnect']);
    window.IntersectionObserver = jasmine.createSpy('IntersectionObserver').and.returnValue(mockIntersectionObserver) as any;
    
    // 3. Mock do ActivatedRoute para simular parâmetros de rota
    mockActivatedRoute = {
      paramMap: new Subject()
    };

    // 4. Mock do Router para simular navegação
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // 5. Mock do Fetch global (usado no ngOnInit para buscar o articles.json)
    spyOn(window, 'fetch').and.returnValue(Promise.resolve({ // Configuração do Mock para o fetch do articles.json
      ok: true,
      json: () => Promise.resolve([
        { title: 'Mock Article', description: 'Mocked desc', date: '2024', pdfPath: 'mock.pdf', slug: 'mock-article' }
      ])
    } as Response));

    await TestBed.configureTestingModule({
      imports: [ArticlesComponent],
      providers: [
        { provide: PdfExtractionService, useValue: mockPdfService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticlesComponent);
    component = fixture.componentInstance;
  });

  // Função auxiliar para emitir um slug na ActivatedRoute
  const emitSlug = (slug: string | null) => (mockActivatedRoute.paramMap as Subject<any>).next(new Map(slug ? [['articleSlug', slug]] : [])); // Adicionado ParamMap

  it('deve criar o componente e buscar o arquivo articles.json no init', fakeAsync(() => {
    fixture.detectChanges(); // Aciona o ngOnInit
    tick(); // Resolve as Promises pendentes do fetch

    expect(component).toBeTruthy();
    expect(window.fetch).toHaveBeenCalled();
    expect(component.articles.length).toBe(1);
    expect(component.articles[0].title).toBe('Mock Article');
  }));

  it('deve carregar um artigo se o slug estiver presente na URL e renderizar as imagens', fakeAsync(() => {
    // O artigo já está no array de `articles` mockado pelo `window.fetch`
    const articleSlug = 'mock-article';

    fixture.detectChanges(); // Aciona ngOnInit e carrega `articles`
    tick(); // Resolve as Promises pendentes do fetch
    fixture.detectChanges(); // Garante que `articles` está disponível

    // Configura o mock para simular sucesso na renderização
    mockPdfService.renderPdfToImages.and.returnValue(Promise.resolve([
      'data:image/png;base64,page1', 
      'data:image/png;base64,page2'
    ]));

    // Aciona a abertura do artigo
    emitSlug(articleSlug); // Simula a navegação para o slug
    fixture.detectChanges(); // Atualiza o componente para reagir à mudança de rota
    
    // Valida o estado de Loading (Spinner)
    expect(component.isLoadingContent).toBeTrue();
    fixture.detectChanges();
    const loadingEl = fixture.nativeElement.querySelector('.loading-content');
    expect(loadingEl).toBeTruthy();
    expect(loadingEl.querySelector('.spinner')).toBeTruthy();

    // Avança o tempo para o Worker terminar
    tick(); 
    fixture.detectChanges();

    // Valida a limpeza do loading e inserção do conteúdo
    expect(component.isLoadingContent).toBeFalse();
    expect(component.articlePages.length).toBe(2);
    expect(component.loadingError).toBeNull();

    const pages = fixture.nativeElement.querySelectorAll('.pdf-page');
    expect(pages.length).toBe(2);
    expect(pages[0].src).toContain('data:image/png;base64,page1');

    flush(); // Limpa o setTimeout do GSAP da fila
  }));

  it('deve exibir mensagem de erro se a renderização do PDF falhar (Prevenção de Tela Branca/Falha Silenciosa)', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    // Simula a navegação para um slug que causará erro (o mockPdfService já está configurado para reject)
    mockPdfService.renderPdfToImages.and.callFake(() => Promise.reject(new Error('PDF loading failed')));
    emitSlug('mock-article'); // Causa o erro no loadArticleContent
    tick();
    fixture.detectChanges();

    // Valida a barreira contra erros
    expect(component.isLoadingContent).toBeFalse();
    expect(component.loadingError).toContain('could not be loaded');
    expect(component.articlePages.length).toBe(0);

    const errorEl = fixture.nativeElement.querySelector('.error-content');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Failed to load article');

    flush();
  }));
});
