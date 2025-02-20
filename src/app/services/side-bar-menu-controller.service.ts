import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SideBarMenuControllerService {

  private sideBarState = new BehaviorSubject<boolean>(false)

  setSideBar(state :boolean){
    this.sideBarState.next(state)
    
  }
  getSideBarState(){
    return this.sideBarState.asObservable();
  }
}
