import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Text3dComponent } from './text3d.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { Text3dService } from '../../../../services/text3d.service.service'; 
import { of } from 'rxjs';

describe('Text3dComponent', () => {
  let component: Text3dComponent;
  let fixture: ComponentFixture<Text3dComponent>;
  let darkModeServiceMock: jasmine.SpyObj<DarkModeControllerService>;
  let animateServiceMock: jasmine.SpyObj<AnimationControllerService>;
  let text3dServiceMock: jasmine.SpyObj<Text3dService>;

  beforeEach(waitForAsync(() => {
    darkModeServiceMock = jasmine.createSpyObj('DarkModeControllerService', ['getDarkModeState']);
    animateServiceMock = jasmine.createSpyObj('AnimationControllerService', ['getAnimationObserbable']);
    text3dServiceMock = jasmine.createSpyObj('Text3dService', ['createText', 'updateTextColor']);

    darkModeServiceMock.getDarkModeState.and.returnValue(of(true));
    animateServiceMock.getAnimationObserbable.and.returnValue(of(true));

    TestBed.configureTestingModule({
      imports: [Text3dComponent], // Importando o componente aqui
      providers: [
        { provide: DarkModeControllerService, useValue: darkModeServiceMock },
        { provide: AnimationControllerService, useValue: animateServiceMock },
        { provide: Text3dService, useValue: text3dServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Text3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize THREE.js renderer and scene', () => {
    expect(component['renderer']).toBeDefined();
    expect(component['scene']).toBeDefined();
    expect(component['camera']).toBeDefined();
  });

  it('should update colors based on dark mode state', () => {
    component.updateColors();
    expect(text3dServiceMock.updateTextColor).toHaveBeenCalledWith(0xffffff);
  });

  it('should call createText on text3dService', () => {
    expect(text3dServiceMock.createText).toHaveBeenCalled();
  });

  afterEach(() => {
    // Cleanup THREE.js renderer to avoid memory leaks
    if (component['renderer']) {
      component['renderer'].dispose();
    }
  });
});