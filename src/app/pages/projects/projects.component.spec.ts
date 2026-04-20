/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsComponent } from './projects.component';
import { DarkModeControllerService } from '../../services/dark-mode-controller.service';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;

  beforeEach(async () => {
    const darkModeSpy = jasmine.createSpyObj('DarkModeControllerService', ['getDarkModeObserbable']);
    darkModeSpy.getDarkModeObserbable.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        { provide: DarkModeControllerService, useValue: darkModeSpy },
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});