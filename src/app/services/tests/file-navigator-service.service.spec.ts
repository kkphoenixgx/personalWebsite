import { TestBed } from '@angular/core/testing'
import { FileNavigatorComponent } from '../../shared/header/partials/side-menu/file-navigator/file-navigator.component'; 

import { SideMenuComponent } from '../../shared/header/partials/side-menu/side-menu.component'; 

describe('SideMenuComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideMenuComponent, FileNavigatorComponent] // Adicione o FileNavigatorComponent aqui
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SideMenuComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
