import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IPage } from '../interface/ITitlesResponse';

@Injectable({
  providedIn: 'root',
})
export class FileNavigatorService {

  getItems() :Observable<IPage[]> {
    const items: Array<IPage> = [
      {
        title: 'Folder 1',
        path: '/folder1',
        items: [
          {
            title: 'arquivo solto 1',
            path: '/folder1/arquivoSolto',
            items: [],
          },
          {
            title: 'arquivo solto 2',
            path: '/folder1/arquivoSolto2',
            items: [],
          },
          {
            title: 'Pasta 2',
            path: '/folder1/folder2/',
            items: [
              {
            title: 'Pasta 2',
            path: '/folder1/folder2/',
            items: [
              {
                title: 'arquivo solto 3',
                path: '/folder1/folder2/arquivoSolto3',
                items: [],
              },
              {
            title: 'Pasta 2',
            path: '/folder1/folder2/',
            items: [
              {
                title: 'arquivo solto 3',
                path: '/folder1/folder2/arquivoSolto3',
                items: [],
              },
              {
            title: 'Pasta 2',
            path: '/folder1/folder2/',
            items: [
              {
                title: 'arquivo solto 3',
                path: '/folder1/folder2/arquivoSolto3',
                items: [],
              },
              {
                title: 'arquivo solto 4',
                path: '/folder1/folder2/arquivoSolto4',
                items: [],
              },
            ],
          },
            ],
          },
            ],
          },
              {
                title: 'arquivo solto 4',
                path: '/folder1/folder2/arquivoSolto4',
                items: [],
              },
            ],
          },
        ]
      },
      {
        title: 'Arquivo solto',
        path: '/arquivo solto',
        items: [],
      },
    ];
    
    // Simula um atraso na resposta para simular um carregamento assíncrono
    return of(items).pipe(delay(1000));
  }

}
