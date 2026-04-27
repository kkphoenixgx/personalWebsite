import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ArticlesComponent, IArticle } from './articles.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PdfExtractionService } from '../../services/pdf-extraction.service';
import { TranslateModule } from '@ngx-translate/core';

describe('ArticlesComponent & PDF Extraction', () => {
  let component: ArticlesComponent;
  let fixture: ComponentFixture<ArticlesComponent>;
  let mockPdfExtractionService: jasmine.SpyObj<PdfExtractionService>;

  beforeEach(async () => {
    mockPdfExtractionService = jasmine.createSpyObj('PdfExtractionService', ['renderPdfToImages']);
    mockPdfExtractionService.renderPdfToImages.and.returnValue(Promise.resolve([]));

    await TestBed.configureTestingModule({
      imports: [ArticlesComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]), // Resolve o erro fatal "router.events is undefined"
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: PdfExtractionService, useValue: mockPdfExtractionService }
      ]
    }).compileComponents();
    
    // Mocks do fetch global para evitar requisições reais durante o ngOnInit
    spyOn(window, 'fetch').and.returnValue(Promise.resolve({
      ok: true,
      json: () => Promise.resolve([])
    } as Response));

    fixture = TestBed.createComponent(ArticlesComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
  });

  it('[Unitário] Deve instanciar o componente de Artigos perfeitamente sem quebrar a Engine', () => {
    expect(component).toBeTruthy();
  });

  it('[Domínio] [pdfExtraction] Deve simular a extração de texto do PDF "The Eye" com sucesso', async () => {
    // Configuramos o Mock para devolver o texto que procuramos quando for o PDF correto
    mockPdfExtractionService.renderPdfToImages.and.callFake((pdfPath: string) => {
      if (pdfPath === 'the-eye.pdf') {
        return Promise.resolve(['Página 1: Inteligência Artificial renderizada com sucesso']);
      }
      return Promise.resolve(['Texto extraído genérico']);
    });

    const theEyeArticle: IArticle = {
      title: 'The Eye',
      description: 'Desc',
      date: '2023',
      pdfPath: 'the-eye.pdf',
      slug: 'the-eye'
    };

    // Act: Disparamos a lógica a partir de um método real do componente
    await component.loadArticleContent(theEyeArticle);

    // Assert: Verificamos se o COMPONENTE reagiu corretamente
    expect(mockPdfExtractionService.renderPdfToImages).toHaveBeenCalledWith('the-eye.pdf'); 
    
    // O componente guarda o resultado no array `articlePages`
    expect(component.articlePages.length).toBeGreaterThan(0);
    expect(component.articlePages[0]).toContain('Inteligência Artificial');
    expect(component.loadingError).toBeNull();
  });
});
