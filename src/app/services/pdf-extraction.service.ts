import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

// --- Polyfills para contornar o conflito entre o PDF.js 5+ e o zone.js do Angular ---
if (typeof (Promise as any).withResolvers === 'undefined') {
  (Promise as any).withResolvers = function () {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}
if (typeof (Promise as any).try === 'undefined') {
  (Promise as any).try = function (callback: any) {
    return new Promise((resolve, reject) => {
      try { resolve(callback()); } catch (error) { reject(error); }
    });
  };
}
if (typeof (Map.prototype as any).getOrInsertComputed === 'undefined') {
  (Map.prototype as any).getOrInsertComputed = function (key: any, callback: any) {
    if (this.has(key)) {
      return this.get(key);
    }
    const value = callback(key);
    this.set(key, value);
    return value;
  };
}
// -------------------------------------------------------------------------------------

@Injectable({
  providedIn: 'root'
})
export class PdfExtractionService {

  constructor() {
    // Usamos a JSDelivr para garantir o MIME Type correto (.mjs) sem falhas de empacotamento no Angular
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`;
  }

  /**
   * Faz a leitura de um arquivo PDF local ou remoto e extrai todo o texto contido nele.
   * @param pdfUrl Caminho do arquivo (ex: 'assets/articles/meu-artigo.pdf')
   * @returns Promise contendo uma string gigante com todo o texto do documento em minúsculas
   */
  async extractTextFromPdf(pdfUrl: string): Promise<string> {
    try {
      // Faz o download nativo ignorando o motor problemático de Streams do PDF.js
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      
      const arrayBuffer = await response.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
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

  /**
   * Renderiza o PDF transformando cada página em uma imagem de alta qualidade.
   * Preserva perfeitamente o layout original, fotos, gráficos e equações.
   */
  async renderPdfToImages(pdfUrl: string): Promise<string[]> {
    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
      
      // Se o Angular não achou o arquivo, ele devolve o index.html (SPA Fallback). 
      // Isso previne que o PDF.js tente ler HTML como PDF.
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
         throw new Error(`Arquivo PDF não encontrado. O servidor retornou uma página HTML.`);
      }

      const arrayBuffer = await response.arrayBuffer();
      
      // CMAPs são obrigatórios para PDFs acadêmicos que usam fontes complexas (CID)
      const loadingTask = pdfjsLib.getDocument({ 
        data: new Uint8Array(arrayBuffer),
        cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`
      });

      const pdf = await loadingTask.promise;
      const pageImages: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        
        const viewport = page.getViewport({ scale: 2.0 }); // Escala HD
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, canvas: canvas, viewport: viewport }).promise;
        pageImages.push(canvas.toDataURL('image/png'));
      }

      return pageImages;
    } catch (error) {
      console.error(`Erro ao renderizar o PDF visualmente (${pdfUrl}):`, error);
      throw error;
    }
  }
}