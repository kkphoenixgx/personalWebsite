import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef, inject, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileNavigatorComponent {
  @Input() public depth: number = 0;
  @Input() public items: IPage[] = [];

  private darkModeService = inject(DarkModeControllerService);
  public darkMode$: Observable<boolean> = this.darkModeService.getDarkModeObserbable();

  //? ----------- Helpers -----------

  isFolder(item: IPage): boolean {
    return Array.isArray(item.items) && item.items.length > 0;
  }

  trackByFn(index: number, item: IPage): string {
    return item.path || String(index);
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
