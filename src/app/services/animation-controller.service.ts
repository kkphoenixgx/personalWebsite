import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnimationControllerService {

  private animationState = new BehaviorSubject<boolean>(true);
  private readonly _animationDelayInMs :number = 500; // Reduzido de 1500 para 500 para melhor LCP (Performance)
  private userPreference: boolean = true;
  private isWindowFocused: boolean = true;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('blur', () => {
        this.isWindowFocused = false;
        this.updateState();
      });
      window.addEventListener('focus', () => {
        this.isWindowFocused = true;
        this.updateState();
      });
    }
  }

  setAnimations(state: boolean) {
    this.userPreference = state;
    this.updateState();
  }
  
  private updateState() {
    this.animationState.next(this.userPreference && this.isWindowFocused);
  }

  getAnimationObserbable() :Observable<boolean>{
    return this.animationState.asObservable();
  }
  
  public get animationDelayInMs() : number {
    return this._animationDelayInMs;
  }
  

}
