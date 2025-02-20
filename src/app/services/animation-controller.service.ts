import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnimationControllerService {

  private animationState = new BehaviorSubject<boolean>(true)


  setAnimations(state :boolean){
    this.animationState.next(state)
  }
  getAnimationState(){
    return this.animationState.asObservable();
  }

}

