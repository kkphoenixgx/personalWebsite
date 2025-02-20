import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Text3dComponent } from './text3d.component';

describe('Text3dComponent', () => {
  let component: Text3dComponent;
  let fixture: ComponentFixture<Text3dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Text3dComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Text3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
