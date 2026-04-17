import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

@Injectable({
  providedIn: 'root'
})
export class PdfExtractionService {

  constructor() {
    // Configura o Web Worker do PDF.js apontando para a CDN usando a versão exata da lib instalada.
    // Isso evita problemas de bloqueio de compilação no Webpack/Angular CLI.
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }

  /**
   * Faz a leitura de um arquivo PDF local ou remoto e extrai todo o texto contido nele.
   * @param pdfUrl Caminho do arquivo (ex: 'assets/articles/meu-artigo.pdf')
   * @returns Promise contendo uma string gigante com todo o texto do documento em minúsculas
   */
  async extractTextFromPdf(pdfUrl: string): Promise<string> {
    try {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + ' ';
      }
      return fullText.toLowerCase(); // Retornamos minúsculo para facilitar o "includes" na barra de pesquisa
    } catch (error) {
      console.error(`Erro ao extrair texto do PDF (${pdfUrl}):`, error);
      return '';
    }
  }
}