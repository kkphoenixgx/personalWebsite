/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';
import { AnimationControllerService } from '../animation-controller.service';

describe('AnimationControllerService', () => {
  let service: AnimationControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnimationControllerService]
    });
    service = TestBed.inject(AnimationControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve emitir true por padrão (Animações ativadas)', (done) => {
    service.getAnimationObserbable().subscribe(state => {
      expect(state).toBeTrue();
      done();
    });
  });

  it('deve emitir false quando setAnimations(false) for chamado', (done) => {
    service.setAnimations(false);
    service.getAnimationObserbable().subscribe(state => {
      expect(state).toBeFalse();
      done();
    });
  });
});