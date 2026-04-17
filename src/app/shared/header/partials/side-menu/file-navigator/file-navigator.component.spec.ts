/// <reference types="jasmine" />
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FileNavigatorComponent } from './file-navigator.component'; 
import { FileNavigatorService } from '../../../../../services/file-navigator-service.service'; 
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { IPage } from '../../../../../interface/ITitlesResponse';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // 20 segundos

describe('FileNavigatorComponent', () => {
  let component: FileNavigatorComponent;
  let fixture: ComponentFixture<FileNavigatorComponent>;
  let fileNavigatorServiceMock: jasmine.SpyObj<FileNavigatorService>;

  // Dados de teste: uma pasta com arquivos no array "response"
  const testData: IPage = {
    title: 'Folder 1',
    path: '/folder1',
    items: [
      { title: 'file1.txt', path: '/folder1/file1.txt', items: [] },
      { title: 'file2.txt', path: '/folder1/file2.txt', items: [] }
    ]
  };

  beforeEach(async () => {
    fileNavigatorServiceMock = jasmine.createSpyObj('FileNavigatorService', ['getItems']);
    // Configuramos o mock para retornar os dados de teste
    fileNavigatorServiceMock.getItems.and.returnValue(Promise.resolve([testData]));

    await TestBed.configureTestingModule({
      // Como o componente é standalone, usamos imports
      imports: [FileNavigatorComponent],
      providers: [
        provideRouter([]),
        { provide: FileNavigatorService, useValue: fileNavigatorServiceMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileNavigatorComponent);
    component = fixture.componentInstance;
    component.items = [testData];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render folder and its files correctly', fakeAsync(() => {
    // Permite que o template se atualize
    tick();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Folder 1');
    expect(compiled.textContent).toContain('file1.txt');
    expect(compiled.textContent).toContain('file2.txt');
  }));

  it('[Stress Test] should not throw stack overflow with deeply nested items', () => {
    // Função para gerar dados profundos
    const generateDeepData = (depth: number, maxDepth: number = 20): IPage[] => {
      if (depth > maxDepth) {
        return [{ title: 'leaf-file.txt', path: '/leaf', items: [] }];
      }
      return [{
        title: `Folder-Level-${depth}`,
        path: `/folder-${depth}`,
        items: generateDeepData(depth + 1, maxDepth)
      }];
    };

    const deepData = generateDeepData(1);
    fixture.componentRef.setInput('items', deepData);

    expect(() => {
      fixture.detectChanges();
    }).withContext('A renderização de itens profundamente aninhados não deve causar um estouro de pilha.').not.toThrow();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Folder-Level-20');
    expect(compiled.textContent).toContain('leaf-file.txt');
  });
});