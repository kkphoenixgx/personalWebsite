/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroComponent } from './hero.component';
import { provideRouter } from '@angular/router';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';

describe('HeroComponent', () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;

  beforeEach(async () => {
    const animationServiceMock = {
      animationDelayInMs: 0,
      getAnimationObserbable: () => of(false) // Desabilita GSAP no teste para checar o DOM limpo
    };

    const darkModeServiceMock = {
      getDarkModeObserbable: () => of(true)
    };

    await TestBed.configureTestingModule({
      imports: [HeroComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: AnimationControllerService, useValue: animationServiceMock },
        { provide: DarkModeControllerService, useValue: darkModeServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    
    // Força os flags para renderização estática e contornar os delays
    component.readyToContent = true;
    component.animate = false;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve renderizar os links sociais (Resume, LinkedIn e GitHub)', () => {
    const links = fixture.debugElement.queryAll(By.css('.info-button'));
    expect(links.length).toBe(3);
    expect(links[0].nativeElement.textContent).toContain('OLD_HERO.DOWNLOAD_RESUME');
    expect(links[1].nativeElement.textContent).toContain('LinkedIn');
    expect(links[2].nativeElement.textContent).toContain('OLD_HERO.GITHUB');
  });

  it('deve renderizar o texto estático de apresentação', () => {
    const heading = fixture.debugElement.query(By.css('.text-effect-container h1'));
    expect(heading.nativeElement.textContent).toContain('OLD_HERO.GREETING');
  });
});
