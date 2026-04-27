/// <reference types="jasmine" />
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PortifolioComponent } from './portifolio.component';
import { By } from '@angular/platform-browser';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

describe('PortifolioComponent', () => {
  let component: PortifolioComponent;
  let fixture: ComponentFixture<PortifolioComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PortifolioComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DarkModeControllerService, useValue: { getDarkModeObserbable: () => of(true) } }
      ]
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(PortifolioComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve iterar e renderizar corretamente os projetos no DOM', () => {
    // Carousel
    const carouselSlides = fixture.debugElement.queryAll(By.css('.carousel-slide'));
    expect(carouselSlides.length).toBe(component.carouselProjects.length);

    // Side Projects
    const sideProjects = fixture.debugElement.queryAll(By.css('.side-projects .portfolio-card'));
    expect(sideProjects.length).toBe(component.endProjects.length);
  });
});
