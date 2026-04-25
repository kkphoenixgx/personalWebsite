/// <reference types="jasmine" />
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SideMenuComponent } from './side-menu.component';
import { provideRouter } from '@angular/router';
import { FileNavigatorService } from '../../../../services/file-navigator-service.service'; 
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { of } from 'rxjs';

describe('SideMenuComponent', () => {
  let component: SideMenuComponent;
  let fixture: ComponentFixture<SideMenuComponent>;
  let fileNavigatorServiceMock: jasmine.SpyObj<FileNavigatorService>;
  let darkModeServiceMock: jasmine.SpyObj<DarkModeControllerService>;
  let animationServiceMock: jasmine.SpyObj<AnimationControllerService>;

  beforeEach(waitForAsync(() => {
    fileNavigatorServiceMock = jasmine.createSpyObj('FileNavigatorService', ['getItems']);
    fileNavigatorServiceMock.getItems.and.returnValue(Promise.resolve([]));
    darkModeServiceMock = jasmine.createSpyObj('DarkModeControllerService', ['getDarkModeObserbable']);
    darkModeServiceMock.getDarkModeObserbable.and.returnValue(of(true));
    animationServiceMock = jasmine.createSpyObj('AnimationControllerService', ['getAnimationObserbable']);
    animationServiceMock.getAnimationObserbable.and.returnValue(of(true));

    TestBed.configureTestingModule({
      imports: [SideMenuComponent],
      providers: [
        provideRouter([]),
        { provide: FileNavigatorService, useValue: fileNavigatorServiceMock },
        { provide: DarkModeControllerService, useValue: darkModeServiceMock },
        { provide: AnimationControllerService, useValue: animationServiceMock },
      ],
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(SideMenuComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});