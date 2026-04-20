import { Component, OnDestroy, OnInit, inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { PdfExtractionService } from '../../services/pdf-extraction.service';
import { gsap } from 'gsap';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router'; // Importar RouterModule, Router, ActivatedRoute e ParamMap
import { Subject, takeUntil } from 'rxjs';
import { Title, Meta } from '@angular/platform-browser';

export interface IArticle {
  title: string;
  description: string;
  date: string;
  pdfPath: string;
  slug: string; // Adicionado para a URL
}

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, RouterModule], // Adicionado RouterModule
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.scss',
})
export class ArticlesComponent implements OnInit, OnDestroy { // Removido AfterViewInit
  public selectedArticle: IArticle | null = null;
  public isLoadingContent: boolean = false;
  public articlePages: string[] = []; // Onde guardaremos as imagens de cada página
  public loadingError: string | null = null;

  private document = inject(DOCUMENT);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router); // Injetado para navegação.
  private activatedRoute = inject(ActivatedRoute); // Injetado para ler parâmetros da rota.
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private observer: IntersectionObserver | null = null;
  private destroy$ = new Subject<void>(); // Adicionado para desinscrever observáveis.

  public articles: IArticle[] = []; // Começa vazio e é preenchido dinamicamente

  constructor( // Removido AfterViewInit
    private pdfExtractionService: PdfExtractionService
  ) { }

  async ngOnInit() {
    this.document.body.style.backgroundColor = '#fdfcf8'; // Off-white de Stanford
    this.document.body.style.transition = 'background-color 0.5s ease';
    
    this.titleService.setTitle('Research & Publications | K. Phoenix');
    this.metaService.updateTag({ name: 'description', content: 'Academic research and technical papers.' });

    // Busca os dados da lista de artigos no arquivo JSON estático
    try {
      const response = await fetch('assets/articles/articles.json');
      if (response.ok) {
        this.articles = await response.json();
        this.articles.forEach(article => {
          // Cria um slug a partir do título para a URL
          article.slug = this.createSlug(article.title);
        });
        this.cdr.detectChanges(); // Garante que a tela atualize a grade de cartões
      } else {
        console.error('Falha ao carregar a lista de artigos do JSON.');
        // Se a requisição falhar, podemos querer navegar de volta para a lista, ou mostrar um erro genérico.
        // Por enquanto, apenas logamos.
      }
    } catch (error) {
      console.error('Erro na requisição dos artigos:', error);
      // Se ocorrer um erro de rede ou parsing, também logamos.
    }
    // Agora que this.articles está populado, podemos processar o slug da URL
    this.processRouteParams();
  }

  private processRouteParams(): void {
    // Assina os parâmetros da rota para carregar o artigo se houver um slug.
    this.activatedRoute.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params: ParamMap) => {
      const articleSlug = params.get('articleSlug');
      if (articleSlug) {
        const articleToLoad = this.articles.find(article => article.slug === articleSlug);
        if (articleToLoad) {
          this.loadArticleContent(articleToLoad);
        } else {
          // Se o slug não for encontrado após o carregamento dos artigos, redirecionamos.
          console.warn(`Artigo com slug '${articleSlug}' não encontrado. Redirecionando para a lista.`);
          this.router.navigate(['/articles'], { replaceUrl: true }); // replaceUrl evita que o histórico do navegador acumule URLs inválidas
        }
      } else {
        this.selectedArticle = null; // Se não há slug na URL, mostra a lista de artigos (grid)
      }
    });
  }


  private createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
      .replace(/[\s_-]+/g, '-') // Substitui espaços e underscores por hífen único
      .replace(/^-+|-+$/g, ''); // Remove hífens do início e fim
  }




  ngOnDestroy(): void {
    this.document.body.style.backgroundColor = '';
    this.destroy$.next(); // Emite um valor para quebrar todas as subscrições
    this.destroy$.complete(); // Completa o Subject
    this.observer?.disconnect();
  }

  // Nova função para carregar o conteúdo do artigo (chamada pelo ngOnInit ou openArticle)
  async loadArticleContent(article: IArticle) {
    this.selectedArticle = article;
    this.isLoadingContent = true;
    this.articlePages = [];
    this.loadingError = null; // Reseta o erro a cada nova tentativa
    this.observer?.disconnect();
    this.cdr.detectChanges(); // Força a tela a mostrar o spinner imediatamente
    
    // Atualiza o SEO dinamicamente para a publicação específica!
    this.titleService.setTitle(`${article.title} | Publication`);
    this.metaService.updateTag({ name: 'description', content: article.description });
    
    try {
      // Lê o PDF e renderiza as páginas perfeitamente
      this.articlePages = await this.pdfExtractionService.renderPdfToImages(encodeURI(article.pdfPath));
      console.log('Sucesso! Páginas renderizadas:', this.articlePages.length);
    } catch (error) {
      this.loadingError = `Article not found. The file at "${article.pdfPath}" could not be loaded.`;
      console.error(this.loadingError, error);
    } finally {
      this.isLoadingContent = false;
      this.cdr.detectChanges(); // Avisa o Angular que o Worker terminou
      if (!this.loadingError) {
        this.setupScrollAnimations();
      }
    }
  }

  // Método para voltar à lista de publicações
  goBackToPublications() {
    this.router.navigate(['/articles']);
  }

  private setupScrollAnimations() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Dispara a animação do parágrafo quando ele entra na tela
          gsap.to(entry.target, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" });
          this.observer?.unobserve(entry.target); // Para de observar após animar
        }
      });
    }, { rootMargin: "0px 0px -30px 0px" });

    // Timeout rápido para garantir que o *ngFor já colocou as tags <p> no DOM
    setTimeout(() => {
      const elements = this.document.querySelectorAll('.pdf-page, .reader-header');
      elements.forEach(el => {
        gsap.set(el, { opacity: 0, y: 30 }); // Deixa todos invisíveis e "caídos"
        this.observer?.observe(el);
      });
    }, 50);
  }
}
