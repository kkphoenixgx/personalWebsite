import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { IObjectResponse } from '../interface/ITitlesResponse';

@Injectable({
  providedIn: 'root',
})
export class FileNavigatorService {
  getItems(): Observable<(IObjectResponse | string)[]> {
    const items: Array<IObjectResponse | string> = [
      {
        title: 'Folder 1',
        path: '/folder1',
        response: ['file1.txt', 'file2.txt'],
      },
      'file2.txt' // Arquivo solto, mas agora seu código precisa lidar com isso corretamente
    ];
    
    // Simula um atraso na resposta para simular um carregamento assíncrono
    return of(items).pipe(delay(1000));
  }
}
