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
  
  public readyToContent = false;
  
  public toogleSettingsAnimate = false;
  public toogleAnimations = true;
  
  // public toogleBtnDarkMode = true;
  
  public toogleDarkMode = true;
  public isDarkMode = true;
  
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

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.readyToContent = true;
    }, this.animateService.animationDelayInMs);
  }

  // ----------- Helpers -----------

  handleMenuClick(): void {
    this.configMenu.toggleMenuConfig();
    this.toogleSettingsAnimate = !this.toogleSettingsAnimate;
  }

  handleSideBarMenu(): void {
    this.sideBarService.setSideBar(!this.toogleSideBarMenu);
  }
}
