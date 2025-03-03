import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnimationControllerService {

  private animationState = new BehaviorSubject<boolean>(true);
  private readonly _animationDelayInMs :number = 1500;


  setAnimations(state :boolean){
    this.animationState.next(state);
  }
  
  getAnimationObserbable() :Observable<boolean>{
    return this.animationState.asObservable();
  }
  
  public get animationDelayInMs() : number {
    return this._animationDelayInMs;
  }
  

}

