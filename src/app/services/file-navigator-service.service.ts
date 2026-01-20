import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { IPage } from '../interface/ITitlesResponse';

@Injectable({
  providedIn: 'root',
})
export class FileNavigatorService {

  // private readonly BACKEND = 'https://api-personalwebsite.kkphoenix.com.br';
  private readonly BACKEND = 'http://192.168.0.30:8081';
  private readonly API_URL = this.BACKEND + '/api/pages/'; 

  private itemsCache: Promise<IPage[]> | null = null;

  constructor(private http: HttpClient) { }

  getItems(): Promise<IPage[]> {
    if (!this.itemsCache) {
      this.itemsCache = (async () => {
        try {
          const data = await lastValueFrom(this.http.get<any[]>(this.API_URL));
          console.log('Dados recebidos da API:', data);
          return this.transformToPage(data);
        } catch (error) {
          console.error('Erro na requisição:', error);
          throw error;
        }
      })();
    }
    return this.itemsCache;
  }

  private transformToPage(items: any[]): IPage[] {
    const mappedItems = (items || [])
      .filter(item => item.title !== '404')
      .map(item => {
      const isFolder = Array.isArray(item.items) && item.items.length > 0;
      return {
        title: item.title,
        path: isFolder ? item.path : `${this.BACKEND}${item.path}`,
        items: item.items ? this.transformToPage(item.items) : []
      } as any;
    });

    return mappedItems.sort((a, b) => {
      const priority = ['Programming', 'Programing', 'Study', 'Stody', 'RPG'];
      const idxA = priority.indexOf(a.title);
      const idxB = priority.indexOf(b.title);

      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;

      const aIsFolder = Array.isArray(a.items) && a.items.length > 0;
      const bIsFolder = Array.isArray(b.items) && b.items.length > 0;
      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;
      return 0;
    });
  }

}
