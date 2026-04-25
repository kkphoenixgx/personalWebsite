import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { HealthComponent } from './health.component';

describe('HealthComponent', () => {
  let component: HealthComponent;
  let fixture: ComponentFixture<HealthComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HealthComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
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
