import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { HealthComponent } from './health.component';
import { DarkModeControllerService } from '../../services/dark-mode-controller.service';

describe('HealthComponent', () => {
  let component: HealthComponent;
  let fixture: ComponentFixture<HealthComponent>;
  let httpMock: HttpTestingController;
  let darkModeServiceMock: jasmine.SpyObj<DarkModeControllerService>;

  beforeEach(async () => {
    darkModeServiceMock = jasmine.createSpyObj('DarkModeControllerService', ['getDarkModeObserbable']);
    darkModeServiceMock.getDarkModeObserbable.and.returnValue(of(true));

    await TestBed.configureTestingModule({
      imports: [HealthComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: DarkModeControllerService, useValue: darkModeServiceMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HealthComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    // Simula as requisições HTTP que o componente faz no ngOnInit
    const coverageReq = httpMock.expectOne('/assets/coverage.json');
    coverageReq.flush({ total: { lines: { pct: 0 }, functions: { pct: 0 }, branches: { pct: 0 } } });

    expect(component).toBeTruthy();
  });
});
