import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FileNavigatorService } from '../../../../../services/file-navigator-service.service';
import { IObjectResponse } from '../../../../../interface/ITitlesResponse';

@Component({
  selector: 'app-file-navigator',
  standalone: true,
  // Adiciona forwardRef para permitir a recursão segura
  imports: [CommonModule, RouterModule, forwardRef(() => FileNavigatorComponent)],
  styleUrls: ['./file-navigator.component.scss'],
  templateUrl: './file-navigator.component.html',
})
export class FileNavigatorComponent implements OnInit {
  @Input() public depth: number = 0;
  @Input() public items: (IObjectResponse | string)[] = [];

  constructor(private fileNavigatorService: FileNavigatorService) {}

  ngOnInit(): void {
    console.log(`\n📂 FileNavigatorComponent (depth: ${this.depth})`);
    console.log('Itens recebidos:', JSON.stringify(this.items, null, 2));
    // Se já tivermos itens, não chama loadItems() para evitar recursão
    if (!this.items || this.items.length === 0) {
      this.loadItems();
    }
  }

  loadItems(): void {
    this.fileNavigatorService.getItems().subscribe((data) => {
      console.log('📥 Dados da API:', JSON.stringify(data, null, 2));
      this.items = data;
    });
  }

  public logClick(item: any) {
    console.log(item);
  }

  isString(item: unknown): item is string {
    return typeof item === 'string';
  }

  isObject(item: any): item is IObjectResponse {
    return (
      typeof item === 'object' &&
      item !== null &&
      'path' in item &&
      'title' in item &&
      Array.isArray(item.response) &&
      item.response.every((i: any) => typeof i === 'string' || this.isObject(i))
    );
  }
}