import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnimationControllerService {

  private animationState = new BehaviorSubject<boolean>(true);
  public animationDelayInMs :number = 2000;


  setAnimations(state :boolean){
    this.animationState.next(state)
  }
  getAnimationState(){
    return this.animationState.asObservable();
  }

}

