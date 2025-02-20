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
});
