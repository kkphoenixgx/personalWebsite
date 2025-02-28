import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  Injector,
  ComponentRef,
  PLATFORM_ID,
  Inject
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { Text3dComponent } from './partials/text3d/text3d.component';
import { SideMenuComponent } from './partials/side-menu/side-menu.component';

import { AnimationControllerService } from '../../services/animation-controller.service';
import { DarkModeControllerService } from '../../services/dark-mode-controller.service';
import { SideBarMenuControllerService } from '../../services/side-bar-menu-controller.service';
import { ConfigMenuComponent } from './partials/config-menu/config-menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, CommonModule, Text3dComponent, SideMenuComponent, ConfigMenuComponent ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  public toogleConfigMenu = false;
  public toogleSideBarMenu = false;
  public toogleSettingsAnimate = false;
  public readyToContent = false;
  public isDarkMode = true;
  public toogleBtnDarkMode = true;
  public toogleAnimations = true;
  public toogleDarkMode = true;
  
  @ViewChild('configMenu') configMenu!: ConfigMenuComponent;

  constructor(
    private animateService: AnimationControllerService,
    private darkModeService: DarkModeControllerService,
    private sideBarService: SideBarMenuControllerService,
    @Inject(PLATFORM_ID) private PLATAFORM_ID: Object,
  ) {}

  // ----------- Lifecycle -----------

  ngOnInit(): void {
    // Observers para estado de animação e modo escuro
    this.animateService.getAnimationObserbable().subscribe((state) => {
      this.toogleAnimations = state;
    });
    this.darkModeService.getDarkModeObserbable().subscribe((state) => {
      this.toogleDarkMode = state;
    });
    this.sideBarService.getSideBarState().subscribe((state) => {
      this.toogleSideBarMenu = state;
    });

    this.preventRightScrool();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.readyToContent = true;
    }, this.animateService.animationDelayInMs);
  }

  // ----------- Main Methods -----------

  preventRightScrool(){
    if (!isPlatformBrowser(this.PLATAFORM_ID)) return;

    document.addEventListener(
      'touchmove',
      function (event) {
        if (event.touches.length > 1 || Math.abs(event.touches[0].clientX) > 0) {
          event.preventDefault();
        }
      },
      { passive: false }
    );
  }

  // ----------- Helpers -----------

  handleMenuClick(): void {
    this.configMenu.toggleMenuConfig();  
  }

  handleSideBarMenu(): void {
    this.sideBarService.setSideBar(!this.toogleSideBarMenu);
  }
}
