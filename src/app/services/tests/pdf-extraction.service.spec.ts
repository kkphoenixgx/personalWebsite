import { TestBed } from '@angular/core/testing';
import { PdfExtractionService } from '../pdf-extraction.service';
import * as pdfjsLib from 'pdfjs-dist';

describe('PdfExtractionService (Extraction & Rendering)', () => {
  let service: PdfExtractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PdfExtractionService]
    });
    service = TestBed.inject(PdfExtractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // MATA OS MUTANTES GLOBAIS DE POLYFILL
  describe('Global Polyfills Coverage', () => {
    it('should cover Promise.withResolvers polyfill', async () => {
      const { promise, resolve } = (Promise as any).withResolvers();
      resolve('ok');
      expect(await promise).toBe('ok');
    });

    it('should cover Promise.try polyfill success and error', async () => {
      const res = await (Promise as any).try(() => 'success');
      expect(res).toBe('success');

      try {
        await (Promise as any).try(() => { throw new Error('fail'); });
      } catch (e: any) {
        expect(e.message).toBe('fail');
      }
    });

    it('should cover Map.prototype.getOrInsertComputed polyfill', () => {
      const map = new Map<string, string>();
      const val1 = (map as any).getOrInsertComputed('key1', () => 'value1');
      expect(val1).toBe('value1');
      
      // Aciona o caminho 'if (this.has(key))' cobrindo o branch de retorno de cache
      const val2 = (map as any).getOrInsertComputed('key1', () => 'value2');
      expect(val2).toBe('value1');
    });
  });

  function mockPdfjsGetDocument(mockPdf: any) {
    return spyOn(service, 'getDocument').and.returnValue({ promise: Promise.resolve(mockPdf) } as any);
  }

  describe('extractTextFromPdf', () => {
    it('should extract text from a valid PDF', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8))
      };
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockResponse as any));

      const mockPage = {
        getTextContent: jasmine.createSpy().and.returnValue(Promise.resolve({
          items: [{ str: 'Hello' }, { str: 'World' }, { other: 'prop' }] // O terceiro não possui 'str' (ignorado)
        }))
      };

      const mockPdf = {
        numPages: 1,
        getPage: jasmine.createSpy().and.returnValue(Promise.resolve(mockPage))
      };

      const getDocumentSpy = mockPdfjsGetDocument(mockPdf);

      const result = await service.extractTextFromPdf('dummy.pdf');
      expect(result).toBe('hello world  '); 
      expect(window.fetch).toHaveBeenCalledWith('dummy.pdf');
      expect(getDocumentSpy).toHaveBeenCalled();
    });

    it('should handle HTTP error gracefully and return empty string', async () => {
      const mockResponse = { ok: false, status: 404 };
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockResponse as any));

      const result = await service.extractTextFromPdf('not-found.pdf');
      expect(result).toBe('');
    });

    it('should catch exceptions and return empty string', async () => {
      spyOn(window, 'fetch').and.returnValue(Promise.reject(new Error('Network error')));
      const spyConsole = spyOn(console, 'error');

      const result = await service.extractTextFromPdf('error.pdf');
      expect(result).toBe('');
      expect(spyConsole).toHaveBeenCalled();
    });
  });

  describe('renderPdfToImages', () => {
    it('should render PDF pages to images (base64)', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'application/pdf');

      const mockResponse = { ok: true, status: 200, headers: mockHeaders, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) };
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockResponse as any));

      const mockPage = {
        getViewport: jasmine.createSpy().and.returnValue({ width: 800, height: 600 }),
        render: jasmine.createSpy().and.returnValue({ promise: Promise.resolve() })
      };
      const mockPdf = { numPages: 1, getPage: jasmine.createSpy().and.returnValue(Promise.resolve(mockPage)) };
      mockPdfjsGetDocument(mockPdf);

      // Mocar a injeção do Canvas físico
      const originalCreateElement = document.createElement.bind(document);
      spyOn(document, 'createElement').and.callFake((tagName: string) => {
        if (tagName === 'canvas') {
          const canvas = originalCreateElement('canvas');
          spyOn(canvas, 'toDataURL').and.returnValue('data:image/png;base64,dummy');
          return canvas;
        }
        return originalCreateElement(tagName);
      });

      const images = await service.renderPdfToImages('dummy.pdf');
      expect(images.length).toBe(1);
      expect(images[0]).toBe('data:image/png;base64,dummy');
    });

    it('should skip page if canvas getContext returns null', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'application/pdf');
      const mockResponse = { ok: true, status: 200, headers: mockHeaders, arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)) };
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockResponse as any));

      const mockPage = { getViewport: () => ({ width: 800, height: 600 }), render: () => ({ promise: Promise.resolve() }) };
      const mockPdf = { numPages: 1, getPage: () => Promise.resolve(mockPage) };
      mockPdfjsGetDocument(mockPdf);

      // Mocar contexto nulo forçando a condicional "if (!context) continue;"
      spyOn(document, 'createElement').and.callFake((tagName: string) => {
        if (tagName === 'canvas') return { getContext: () => null, width: 0, height: 0, toDataURL: () => '' } as any;
        return document.createElement(tagName);
      });

      const images = await service.renderPdfToImages('dummy.pdf');
      expect(images.length).toBe(0);
    });

    it('should throw error if content-type is text/html (Angular SPA Fallback Guard)', async () => {
      const mockHeaders = new Headers();
      mockHeaders.set('content-type', 'text/html; charset=utf-8');
      const mockResponse = { ok: true, status: 200, headers: mockHeaders };
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockResponse as any));

      await expectAsync(service.renderPdfToImages('fallback.pdf')).toBeRejectedWithError(/The server returned an HTML page/);
    });
  });
});