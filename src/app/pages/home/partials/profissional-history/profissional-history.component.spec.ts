import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfissionalHistoryComponent } from './profissional-history.component';

describe('ProfissionalHistoryComponent', () => {
  let component: ProfissionalHistoryComponent;
  let fixture: ComponentFixture<ProfissionalHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfissionalHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfissionalHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
