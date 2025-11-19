import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, forwardRef, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

import { IPage } from '../../../../../interface/ITitlesResponse';
import { DarkModeControllerService } from '../../../../../services/dark-mode-controller.service';

@Component({
  selector: 'app-file-navigator',
  standalone: true,
  imports: [CommonModule, RouterModule, forwardRef(() => FileNavigatorComponent)],
  styleUrls: ['./file-navigator.component.scss'],
  templateUrl: './file-navigator.component.html',
})
export class FileNavigatorComponent implements OnInit {
  @Input() public depth: number = 0;
  @Input() public items: IPage[] = [];

  private darkModeService = inject(DarkModeControllerService);
  public darkMode$: Observable<boolean> = this.darkModeService.getDarkModeObserbable();

  ngOnInit(): void {
    this.items = this.sortFoldersFirst(this.items);
  }

  private sortFoldersFirst(items: IPage[]): IPage[] {
    return items
      .slice()
      .sort((a, b) => {
        const aIsFolder = this.isFolder(a);
        const bIsFolder = this.isFolder(b);
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        return 0;
      })
      .map(item => {
        if (item.items) item.items = this.sortFoldersFirst(item.items);
        return item;
      });
  }

  //? ----------- Helpers -----------

  isFolder(item: IPage): boolean {
    return Array.isArray(item.items) && item.items.length > 0;
  }

  //! ----------- Debug -----------
  logItems() {
    console.log(`\n📂 FileNavigatorComponent (depth: ${this.depth})`);
    console.log('Itens recebidos:', JSON.stringify(this.items, null, 2));
  }

  public logClick(item: any) {
    console.log(item);
  }
}
