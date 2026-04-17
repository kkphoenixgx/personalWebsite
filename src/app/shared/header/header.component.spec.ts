/// <reference types="jasmine" />
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { FileNavigatorService } from '../../services/file-navigator-service.service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(waitForAsync(() => {
    const fileNavigatorServiceMock = jasmine.createSpyObj('FileNavigatorService', ['getItems']);
    fileNavigatorServiceMock.getItems.and.returnValue(Promise.resolve([]));

    TestBed.configureTestingModule({
      imports: [HeaderComponent], // Standalone component
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) } // Mock de ActivatedRoute
        },
        { provide: FileNavigatorService, useValue: fileNavigatorServiceMock }
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
