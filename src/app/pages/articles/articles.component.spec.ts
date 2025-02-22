import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ArticlesComponent } from './articles.component';

describe('ArticlesComponent', () => {
  let component: ArticlesComponent;
  let fixture: ComponentFixture<ArticlesComponent>;

  beforeEach(waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [ArticlesComponent]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ArticlesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
    }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
