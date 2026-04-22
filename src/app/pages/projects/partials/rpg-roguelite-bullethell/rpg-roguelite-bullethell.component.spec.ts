import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RpgRogueliteBullethellComponent } from './rpg-roguelite-bullethell.component';

describe('RpgRogueliteBullethellComponent', () => {
  let component: RpgRogueliteBullethellComponent;
  let fixture: ComponentFixture<RpgRogueliteBullethellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RpgRogueliteBullethellComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RpgRogueliteBullethellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
