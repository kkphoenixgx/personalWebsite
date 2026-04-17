/// <reference types="jasmine" />
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import Ajv from 'ajv';

import { FileNavigatorService } from '../file-navigator-service.service';
import { IPage } from '../../interface/ITitlesResponse';

describe('FileNavigatorService (Hexagonal Integrity & Domain Logic)', () => {
  let service: FileNavigatorService;
  let httpMock: HttpTestingController;
  let ajv: Ajv;

  // JSON Schema para a interface IPage, incluindo recursividade
  const pageSchema = {
    type: 'array',
    items: { $ref: '#/definitions/page' },
    definitions: {
      page: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          path: { type: 'string' },
          items: { type: 'array', items: { $ref: '#/definitions/page' } }
        },
        required: ['title', 'path', 'items']
      }
    }
  };
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FileNavigatorService,
        provideHttpClient(),
        provideHttpClientTesting() // Provedor de mock para requisições HTTP
      ]
    });
    service = TestBed.inject(FileNavigatorService);
    httpMock = TestBed.inject(HttpTestingController);
    ajv = new Ajv();
    
    // Reseta o cache interno da classe para forçar o fetch nas suítes
    (service as any).itemsCache = null;
  });

  afterEach(() => {
    httpMock.verify(); // Garante que não sobrou requisições pendentes sem mock
  });

  it('should handle HTTP errors gracefully on getItems', async () => {
    const promise = service.getItems();
    
    const req = httpMock.expectOne('https://api-personalwebsite.kkphoenix.com.br/api/pages/');
    req.flush('Internal Server Error', { status: 500, statusText: 'Server Error' });

    try {
      await promise;
      fail('A promise deveria ter sido rejeitada com erro 500');
    } catch (error: any) {
      expect(error.status).toBe(500);
    }
  });

  it('should filter blacklisted items, map paths, and sort correctly (Business Logic)', async () => {
    const mockResponse = [
      { title: '404', path: '/404' }, // Deve ser filtrado
      { title: 'Normal Note', path: '/normal' }, 
      { title: 'sync conflict', path: '/conflict' }, // Deve ser filtrado
      { title: '.excalidraw', path: '/draw' }, // Deve ser filtrado
      { title: 'Study', path: '/study', items: [{ title: 'Math', path: '/math' }] }, // Pasta, deve ir pro começo
      { title: 'Programming', path: '/prog', items: [{ title: 'Angular', path: '/angular' }] } // Pasta, deve ir em 1º
    ];

    const promise = service.getItems();
    const req = httpMock.expectOne('https://api-personalwebsite.kkphoenix.com.br/api/pages/');
    req.flush(mockResponse); // Responde a chamada com o array falso

    const items = await promise;

    // 1. Blacklist Check: 3 dos 6 itens são proibidos
    expect(items.length).toBe(3); 
    
    // 2. Sort Check: Programming tem maior prioridade, depois Study, depois Arquivos normais
    expect(items[0].title).toBe('Programming');
    expect(items[1].title).toBe('Study');
    expect(items[2].title).toBe('Normal Note');

    // 3. Mapping Check: A pasta preserva o caminho, arquivos ganham rota estática com a base URL da API
    expect(items[0].path).toBe('/prog');
    expect(items[2].path).toBe('https://api-personalwebsite.kkphoenix.com.br/normal');
  });

  it('[Contract Test] should return data conforming to the IPage schema', async () => {
    const mockApiResponse: IPage[] = [
      { title: 'Root Folder', path: '/root', items: [
        { title: 'Child File.md', path: '/root/child.md', items: [] }
      ]},
      { title: 'Another File.md', path: '/another.md', items: [] }
    ];

    const promise = service.getItems();
    const req = httpMock.expectOne('https://api-personalwebsite.kkphoenix.com.br/api/pages/');
    req.flush(mockApiResponse);

    await promise;

    const validate = ajv.compile(pageSchema);
    const isValid = validate(mockApiResponse);

    expect(isValid).withContext('A resposta da API não corresponde ao contrato do schema IPage. Erros: ' + ajv.errorsText(validate.errors)).toBe(true);
  });
});
