/// <reference types="jasmine" />
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ProfessionalHistoryComponent } from './professional-history.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

describe('ProfessionalHistoryComponent', () => {
  let component: ProfessionalHistoryComponent;
  let fixture: ComponentFixture<ProfessionalHistoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ProfessionalHistoryComponent, TranslateModule.forRoot()], // Use imports instead of declarations for standalone components
      schemas: [NO_ERRORS_SCHEMA] // Add NO_ERRORS_SCHEMA to ignore unknown elements and attributes
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(ProfessionalHistoryComponent);
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
