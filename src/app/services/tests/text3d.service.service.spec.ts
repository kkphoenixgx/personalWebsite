import { TestBed } from '@angular/core/testing';

import { Text3dService } from '../text3d.service.service';

describe('Text3dServiceService', () => {
  let service: Text3dService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Text3dService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
