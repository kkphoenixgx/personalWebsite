import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { TheEyeComponent } from './the-eye.component';
import { TheEyeControllerService } from '../../../../../../services/the-eye-controller.service';
import { of } from 'rxjs';

describe('TheEyeComponent', () => {
  let component: TheEyeComponent;
  let fixture: ComponentFixture<TheEyeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TheEyeComponent],
      providers: [
        { provide: TheEyeControllerService, useValue: { getAngryObservable: () => of(false), setAngry: () => {} } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TheEyeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call setAngry(true) on click and then setAngry(false) after 2.5 seconds', fakeAsync(() => {
    const service = TestBed.inject(TheEyeControllerService);
    spyOn(service, 'setAngry');

    component.onClick();

    expect(service.setAngry).toHaveBeenCalledWith(true);

    tick(2499); // Antes do timeout
    expect(service.setAngry).toHaveBeenCalledTimes(1);

    tick(1); // Exatamente no timeout
    expect(service.setAngry).toHaveBeenCalledWith(false);
    expect(service.setAngry).toHaveBeenCalledTimes(2);
  }));

  it('should not update pupilTransform on mousemove if isAngry is true', () => {
    component.isAngry = true;
    const initialTransform = component.pupilTransform;
    
    // Simula um movimento do mouse
    const mockMouseEvent = new MouseEvent('mousemove', { clientX: 1000, clientY: 1000 });
    component.onMouseMove(mockMouseEvent);

    // O transform não deve mudar do estado inicial (centralizado)
    expect(component.pupilTransform).toBe(initialTransform);
  });
});
