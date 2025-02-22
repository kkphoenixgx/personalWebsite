import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PortifolioComponent } from './portifolio.component';

describe('PortifolioComponent', () => {
  let component: PortifolioComponent;
  let fixture: ComponentFixture<PortifolioComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PortifolioComponent]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(PortifolioComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
