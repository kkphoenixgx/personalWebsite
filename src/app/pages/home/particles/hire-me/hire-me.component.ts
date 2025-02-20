import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service'; 
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hire-me',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hire-me.component.html',
  styleUrl: './hire-me.component.scss'
})
export class HireMeComponent {

  private darkModeService = inject(DarkModeControllerService);
  public darkMode$: Observable<Boolean> = this.darkModeService.getDarkModeState();


}
