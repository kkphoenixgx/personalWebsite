import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigMenuComponent } from './config-menu.component';

describe('ConfigMenuComponent', () => {
  let component: ConfigMenuComponent;
  let fixture: ComponentFixture<ConfigMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
