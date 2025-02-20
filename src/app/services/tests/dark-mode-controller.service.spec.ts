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
});
