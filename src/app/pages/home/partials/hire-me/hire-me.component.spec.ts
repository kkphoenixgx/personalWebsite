/// <reference types="jasmine" />
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HireMeComponent } from './hire-me.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { of, BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

describe('HireMeComponent', () => {
  let component: HireMeComponent;
  let fixture: ComponentFixture<HireMeComponent>;
  let mockDarkModeService: any;
  let mockAnimationService: any;

  beforeEach(async () => {
    mockDarkModeService = {
      getDarkModeObserbable: () => of(true)
    };

    mockAnimationService = {
      getAnimationObserbable: () => new BehaviorSubject<boolean>(false).asObservable(),
      animationDelayInMs: 500
    };

    await TestBed.configureTestingModule({
      imports: [HireMeComponent, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: DarkModeControllerService, useValue: mockDarkModeService },
        { provide: AnimationControllerService, useValue: mockAnimationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HireMeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar as informações de contato corretas', () => {
    const links = fixture.debugElement.queryAll(By.css('.container-me-info a'));
    expect(links.length).toBe(4);
    expect(links[0].nativeElement.getAttribute('href')).toContain('tel:+5521993344251');
    expect(links[1].nativeElement.getAttribute('href')).toContain('mailto:kauaalvesWorkplace@gmail.com');
    expect(links[2].nativeElement.getAttribute('href')).toContain('linkedin.com');
    expect(links[3].nativeElement.getAttribute('href')).toContain('github.com');
  });
});
