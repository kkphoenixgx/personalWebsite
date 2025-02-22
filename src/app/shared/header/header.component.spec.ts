import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HeaderComponent], // Standalone component
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) } // Mock de ActivatedRoute
        }
      ],
      schemas: [NO_ERRORS_SCHEMA] // Ignorar erros de templates
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(HeaderComponent);
      component = fixture.componentInstance;
      return fixture.whenStable();
    })
    .then(() => {
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
