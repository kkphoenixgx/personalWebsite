import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Text3dComponent } from './text3d.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { Text3dService } from '../../../../services/text3d.service.service'; 
import { of } from 'rxjs';
import { Router } from '@angular/router';

describe('Text3dComponent', () => {
  let component: Text3dComponent;
  let fixture: ComponentFixture<Text3dComponent>;
  let darkModeServiceMock: jasmine.SpyObj<DarkModeControllerService>;
  let animateServiceMock: jasmine.SpyObj<AnimationControllerService>;
  let text3dServiceMock: jasmine.SpyObj<Text3dService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(waitForAsync(() => {
    darkModeServiceMock = jasmine.createSpyObj('DarkModeControllerService', ['getDarkModeObserbable']);
    animateServiceMock = jasmine.createSpyObj('AnimationControllerService', ['getAnimationObserbable']);
    text3dServiceMock = jasmine.createSpyObj('Text3dService', ['createText', 'updateTextColor', 'getTextMesh']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    darkModeServiceMock.getDarkModeObserbable.and.returnValue(of(true));
    animateServiceMock.getAnimationObserbable.and.returnValue(of(true));

    TestBed.configureTestingModule({
      imports: [Text3dComponent],
      providers: [
        { provide: DarkModeControllerService, useValue: darkModeServiceMock },
        { provide: AnimationControllerService, useValue: animateServiceMock },
        { provide: Text3dService, useValue: text3dServiceMock },
        { provide: Router, useValue: routerMock }
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Text3dComponent);
    component = fixture.componentInstance;
    
    // Mockando initThreejs para evitar falhas de WebGL no Karma
    spyOn(component as any, 'initThreejs').and.callFake(() => {
      (component as any).renderer = { 
        dispose: () => {},
        setSize: () => {},
        domElement: document.createElement('canvas')
      };
      (component as any).scene = {};
      (component as any).camera = {
        updateProjectionMatrix: () => {},
        position: { z: 0 }
      };
      (component as any).updateColors();
      (component as any).createText();
    });
    
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (component as any).updateColors();
    expect(text3dServiceMock.updateTextColor).toHaveBeenCalledWith(0xffffff);
  });

  it('should call createText on text3dService', () => {
    expect(text3dServiceMock.createText).toHaveBeenCalled();
  });

  afterEach(() => {
    // Cleanup mock renderer
    if (component['renderer']) {
      component['renderer'].dispose();
    }
  });
});
