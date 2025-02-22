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
});