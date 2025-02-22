import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DarkModeControllerServiceMock {
  private darkModeState = new BehaviorSubject<boolean>(true);

  setDarkMode(state: boolean) {
    this.darkModeState.next(state);
  }

  getDarkModeState() {
    return this.darkModeState.asObservable();
  }

  // Adicione métodos adicionais para simular comportamentos conforme necessário
}