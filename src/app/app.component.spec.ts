import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';
import { FileNavigatorService } from './services/file-navigator-service.service';
import { TranslateModule } from '@ngx-translate/core';

describe('AppComponent', () => {
  beforeEach(async () => {
    const fileNavigatorServiceMock = jasmine.createSpyObj('FileNavigatorService', ['getItems']);
    fileNavigatorServiceMock.getItems.and.returnValue(Promise.resolve([]));

    await TestBed.configureTestingModule({
      imports: [AppComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: FileNavigatorService, useValue: fileNavigatorServiceMock }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
