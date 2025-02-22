import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ProfissionalHistoryComponent } from './profissional-history.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('ProfissionalHistoryComponent', () => {
  let component: ProfissionalHistoryComponent;
  let fixture: ComponentFixture<ProfissionalHistoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ProfissionalHistoryComponent], // Use imports instead of declarations for standalone components
      schemas: [NO_ERRORS_SCHEMA] // Add NO_ERRORS_SCHEMA to ignore unknown elements and attributes
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(ProfissionalHistoryComponent);
      component = fixture.componentInstance;
      return fixture.whenStable(); // Wait for async tasks to complete
    })
    .then(() => {
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});