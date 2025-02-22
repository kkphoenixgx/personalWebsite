import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FileNavigatorComponent } from './file-navigator.component'; 
import { FileNavigatorService } from '../../../../../services/file-navigator-service.service'; 
import { of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { IObjectResponse } from '../../../../../interface/ITitlesResponse';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000; // 20 segundos

describe('FileNavigatorComponent', () => {
  let component: FileNavigatorComponent;
  let fixture: ComponentFixture<FileNavigatorComponent>;
  let fileNavigatorServiceMock: jasmine.SpyObj<FileNavigatorService>;

  // Dados de teste: uma pasta com arquivos no array "response"
  const testData: IObjectResponse = {
    title: 'Folder 1',
    path: '/folder1',
    response: ['file1.txt', 'file2.txt']
  };

  beforeEach(async () => {
    fileNavigatorServiceMock = jasmine.createSpyObj('FileNavigatorService', ['getItems']);
    // Configuramos o mock para retornar os dados de teste
    fileNavigatorServiceMock.getItems.and.returnValue(of([testData]));

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
});