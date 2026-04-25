import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FileNavigatorService } from '../file-navigator-service.service';
import { IPage } from '../../interface/ITitlesResponse';

describe('FileNavigatorService (Arquitetura Hexagonal & Resiliência)', () => {
  let service: FileNavigatorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FileNavigatorService,
        provideHttpClient(),
        provideHttpClientTesting() // Intercepta chamadas reais, garantindo isolamento
      ]
    });
    service = TestBed.inject(FileNavigatorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Garante que não há requisições HTTP pendentes vazando
  });

  it('[Domínio] should filter out blacklisted files (.excalidraw, sync conflict, 404)', async () => {
    // Simulamos um payload caótico do backend Spring Java
    const mockApiResponse: IPage[] = [
      { title: 'Valid Folder', path: '/valid-folder', items: [
        { title: 'Clean File', path: '/valid-folder/clean', items: [] },
        { title: 'My note.excalidraw', path: '/valid-folder/note.excalidraw', items: [] },
        { title: 'Draft sync conflict 2023', path: '/valid-folder/conflict', items: [] }
      ]},
      { title: '404', path: '/404', items: [] }
    ];

    // Aciona a busca de itens (A promessa ficará pendente até o httpMock responder)
    const getItemsPromise = service.getItems();

    // Intercepta a requisição e responde com o mock
    const req = httpMock.expectOne((request) => request.url.includes('api/pages'));
    expect(req.request.method).toBe('GET');
    req.flush(mockApiResponse);

    const result = await getItemsPromise;

    // Validações arquiteturais do contrato
    expect(result.length).toBe(1, 'Deveria ter filtrado a pasta "404" da raiz.');
    expect(result[0].items?.length).toBe(1, 'Deveria ter sobrado apenas 1 arquivo limpo dentro da pasta.');
    expect(result[0].items![0].title).toBe('Clean File', 'O arquivo .excalidraw e o sync conflict devem ser sumariamente ignorados.');
  });

  it('[Stress] should safely parse deeply nested structures without Stack Overflow', async () => {
    // Gera uma árvore massiva e recursiva de 100 níveis de profundidade
    const generateDeepTree = (depth: number, max: number): IPage[] => {
      if (depth >= max) return [{ title: 'The Core', path: '/core', items: [] }];
      return [{ title: `Level ${depth}`, path: `/level-${depth}`, items: generateDeepTree(depth + 1, max) }];
    };

    const massiveMock = generateDeepTree(0, 100);
    
    const getItemsPromise = service.getItems();
    const req = httpMock.expectOne((request) => request.url.includes('api/pages'));
    req.flush(massiveMock);

    let parsedTree: IPage[] = [];
    // A asserção ".not.toThrow()" garante que a recursão de limpeza não exploda a pilha
    await expectAsync(
      getItemsPromise.then(res => { parsedTree = res; })
    ).toBeResolved();

    // Checa se o último nível sobreviveu ao parsing de rotas absolutas do backend
    let pointer = parsedTree[0];
    for(let i = 0; i < 100; i++) {
      pointer = pointer.items![0];
    }
    expect(pointer.title).toBe('The Core');
  });
});