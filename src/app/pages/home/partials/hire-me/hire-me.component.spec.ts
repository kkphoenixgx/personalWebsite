import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HireMeComponent } from './hire-me.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HireMeComponent', () => {
  let component: HireMeComponent;
  let fixture: ComponentFixture<HireMeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HireMeComponent],
      schemas: [NO_ERRORS_SCHEMA] // Add NO_ERRORS_SCHEMA to ignore unknown elements and attributes
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(HireMeComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
