import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TheEyeControllerService {

  private isAngryState = new BehaviorSubject<boolean>(false);

  setAngry(state: boolean) {
    this.isAngryState.next(state);
  }

  getAngryObservable(): Observable<boolean> {
    return this.isAngryState.asObservable();
  }
}