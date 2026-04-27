/// <reference types="jasmine" />
import { TestBed } from '@angular/core/testing';

import { SideBarMenuControllerService } from '../side-bar-menu-controller.service';

describe('SideBarMenuControllerService', () => {
  let service: SideBarMenuControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SideBarMenuControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve emitir false por padrão (Menu fechado)', (done) => {
    service.getSideBarState().subscribe(state => {
      expect(state).toBeFalse();
      done();
    });
  });

  it('deve emitir true quando setSideBar(true) for chamado', (done) => {
    service.setSideBar(true);
    service.getSideBarState().subscribe(state => {
      expect(state).toBeTrue();
      done();
    });
  });
});
