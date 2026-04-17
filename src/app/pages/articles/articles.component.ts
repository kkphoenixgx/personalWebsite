import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PdfExtractionService } from '../../services/pdf-extraction.service';

export interface IArticle {
  title: string;
  description: string;
  date: string;
  pdfPath: string;
  safeUrl?: SafeResourceUrl;
  extractedText?: string;
  isExtracting?: boolean;
}

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.scss'
})
export class ArticlesComponent implements OnInit, OnDestroy {
  public selectedArticle: IArticle | null = null;
  public searchTerm: string = '';

  public articles: IArticle[] = [
    {
      title: 'The BIG Agent: The Utilization of Embedded Multi-Agent Systems in Unmanned Aerial Vehicles for Autonomous Operations',
      description: 'Inspired by the high crime rates in Brazil and the use of drones in strategic sectors, this work presents an integration of multi-agent systems (MAS) embedded within unmanned aerial vehicles (UAVs) for autonomous and distributed route operations.',
      date: 'WESAAC 2025',
      pdfPath: 'assets/articles/The BIG Agent: The Utilization of Embedded Multi-AgentSystems in Unmanned Aerial Vehicles for AutonomousOperations.pdf'
    }
  ];

  // @Inject(DOCUMENT) private document: Document
  constructor(
    private sanitizer: DomSanitizer,
    private pdfExtractionService: PdfExtractionService
  ) {}

  ngOnInit() {
    // // Força a mudança de ambiente (Stanford Theme) alterando o body
    // this.document.body.style.backgroundColor = '#fdfcf8'; // Off-white clássico
    // this.document.body.style.transition = 'background-color 0.5s ease';

    // Prepara a URL sanitizada para o iframe injetar o PDF interno com segurança
    this.articles.forEach(article => {
      // O encodeURI garante que os espaços virem %20 e a URL não quebre no Iframe
      article.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(encodeURI(article.pdfPath));
      
      // Dispara o worker em background para ler e indexar o PDF em memória (Search Engine)
      article.isExtracting = true;
      this.pdfExtractionService.extractTextFromPdf(article.pdfPath).then(text => {
        article.extractedText = text;
        article.isExtracting = false;
      });
    });
  }

  ngOnDestroy(): void {
    // Limpa a cor de fundo ao sair para que o Dark Mode global volte a dominar
    // this.document.body.style.backgroundColor = '';
  }

  openArticle(article: IArticle, event: Event) {
    event.preventDefault();
    this.selectedArticle = article;
  }

  get filteredArticles(): IArticle[] {
    if (!this.searchTerm.trim()) return this.articles;
    
    const term = this.searchTerm.toLowerCase();
    return this.articles.filter(article => 
      article.title.toLowerCase().includes(term) ||
      article.description.toLowerCase().includes(term) ||
      (article.extractedText && article.extractedText.includes(term))
    );
  }
}
