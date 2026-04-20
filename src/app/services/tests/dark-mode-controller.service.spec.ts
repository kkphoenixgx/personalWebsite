/// <reference types="jasmine" />

import { TestBed } from '@angular/core/testing';

import { DarkModeControllerService } from '../dark-mode-controller.service';

describe('DarkModeControllerService', () => {
  let service: DarkModeControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DarkModeControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve emitir true por padrão (Dark Mode ativado na inicialização)', (done) => {
    service.getDarkModeObserbable().subscribe(state => {
      expect(state).toBeTrue();
      done();
    });
  });

  it('deve emitir false quando setDarkMode(false) for chamado', (done) => {
    service.setDarkMode(false);
    service.getDarkModeObserbable().subscribe(state => {
      expect(state).toBeFalse();
      done();
    });
  });
});
