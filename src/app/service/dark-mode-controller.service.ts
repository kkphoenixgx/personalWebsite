import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DarkModeControllerService {
  private darkModeState = new BehaviorSubject<boolean>(true)

  setDarkMode(state :boolean){
    this.darkModeState.next(state)
    
  }
  getDarkModeState(){
    return this.darkModeState.asObservable();
  }

}
