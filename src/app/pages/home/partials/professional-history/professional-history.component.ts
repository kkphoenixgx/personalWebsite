import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';

@Component({
  selector: 'app-professional-history',
  imports: [ CommonModule ],
  templateUrl: './professional-history.component.html',
  styleUrl: './professional-history.component.scss'
})
export class ProfessionalHistoryComponent {

  private darkModeService = inject(DarkModeControllerService);
  public darkMode$: Observable<boolean> = this.darkModeService.getDarkModeObserbable();

}
