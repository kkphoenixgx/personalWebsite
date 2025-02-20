import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ITitlesResponse, IObjectResponse } from '../../../../../interface/ITitlesResponse'; 
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-file-navigator',
  standalone: true,
  imports: [CommonModule, RouterModule],
  styleUrl: './file-navigator.component.scss',
  template: `
    <ul class="ulFileNavigator">
      <ng-container *ngFor="let item of items; let i = index">
        <!-- Se for string (arquivo), renderiza como li com margem ajustada pela profundidade -->
        <ng-container *ngIf="isString(item); else folderTemplate">
          <li class="liFileNavigator" [ngStyle]="{'margin-left': depth * 20 + 'px'}">
            <a [routerLink]="item">{{ item }}</a>
          </li>
        </ng-container>

        <!-- Se for IObjectResponse (pasta), renderiza como details -->
        <ng-template #folderTemplate>
          <ng-container *ngIf="isObject(item)">
            <details class="detailsFileNavigator" [ngStyle]="{'margin-left': depth * 20 + 'px'}">
              <summary class="summaryFileNavigator">{{ item.tittle }}</summary>
              <!-- Recursão para renderizar o conteúdo interno da pasta -->
              <app-file-navigator [items]="item.response" [depth]="depth + 1"></app-file-navigator>
            </details>
          </ng-container>
        </ng-template>
      </ng-container>
    </ul>
  `,
})
export class FileNavigatorComponent {
  @Input() items: Array<IObjectResponse | string> = [];
  @Input() depth: number = 0; // Propriedade para controle da profundidade de pastas

  isString(item: any): item is string {
    return typeof item === 'string';
  }

  isObject(item: any): item is IObjectResponse {
    return typeof item === 'object' && item !== null && 'path' in item && 'tittle' in item && 'response' in item;
  }
}
