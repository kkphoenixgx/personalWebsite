import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PortifoilioComponent } from './portifoilio.component';

describe('PortifoilioComponent', () => {
  let component: PortifoilioComponent;
  let fixture: ComponentFixture<PortifoilioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortifoilioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PortifoilioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
