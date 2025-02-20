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

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, CommonModule, Text3dComponent, SideMenuComponent ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, AfterViewInit {
  public toogleConfigMenu = false;
  public toogleSideBarMenu = false;
  public toogleSettingsAnimate = false;
  public readyToContent = false;
  public toogleLamp = false;
  public isDarkMode = true;
  public toogleBtnDarkMode = true;
  public toogleAnimations = true;
  public toogleDarkMode = true;

  @ViewChild('lampContainer', { read: ViewContainerRef }) lampContainer!: ViewContainerRef;

  private lampComponentRef!: ComponentRef<any>;

  constructor(
    private animateService: AnimationControllerService,
    private darkModeService: DarkModeControllerService,
    private sideBarService: SideBarMenuControllerService,
    private injector: Injector,
    @Inject(PLATFORM_ID) private PLATAFORM_ID: Object,
  ) {}

  ngOnInit(): void {
    // Observers para estado de animação e modo escuro
    this.animateService.getAnimationState().subscribe((state) => {
      this.toogleAnimations = state;
    });
    this.darkModeService.getDarkModeState().subscribe((state) => {
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
    }, 5000);
  }

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

  async loadLampComponent() {
    if (this.toogleLamp && !this.lampComponentRef) {
      // Importa o LampComponent dinamicamente
      const { LampComponent } = await import('../../elements/lamp/lamp.component');
      // Cria a instância do componente
      this.lampComponentRef = this.lampContainer.createComponent(LampComponent, {
        injector: this.injector
      });
    } else if (!this.toogleLamp && this.lampComponentRef) {
      // Remove o componente se toggle estiver desativado
      this.lampComponentRef.destroy();
      this.lampComponentRef = null as any;
    }
  }

  handleToogleLamp() {
    this.toogleLamp = !this.toogleLamp;
    this.toogleBtnDarkMode = !this.toogleBtnDarkMode;
    this.loadLampComponent();
  }

  handleToogleAnimations() {
    this.animateService.setAnimations(!this.toogleAnimations);
  }

  handleMenuClick(): void {
    const menu = document.querySelector('#configMenuContainer') as HTMLDivElement;

    if (!this.toogleConfigMenu) {
      menu.style.right = '0vw';
      this.toogleConfigMenu = true;
      this.toogleSettingsAnimate = true;
    } else {
      menu.style.right = '-70vw';
      this.toogleConfigMenu = false;
      this.toogleSettingsAnimate = false;
    }
  }

  handleSideBarMenu(): void {
    this.sideBarService.setSideBar(!this.toogleSideBarMenu);
  }
}
