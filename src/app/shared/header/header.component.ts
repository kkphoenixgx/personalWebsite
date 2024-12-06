import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
  ViewContainerRef,
  Injector,
  ComponentRef
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Text3dComponent } from '../text3d/text3d.component';
import { SideMenuComponent } from '../side-menu/side-menu.component';
import { AnimationControllerService } from '../../service/animation-controller.service';
import { DarkModeControllerService } from '../../service/dark-mode-controller.service';
import { SideBarMenuControllerService } from '../../service/side-bar-menu-controller.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatIconModule, CommonModule, Text3dComponent, SideMenuComponent],
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
    private injector: Injector
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
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.readyToContent = true;
    }, 5000);
  }

  async loadLampComponent() {
    if (this.toogleLamp && !this.lampComponentRef) {
      // Importa o LampComponent dinamicamente
      const { LampComponent } = await import('../lamp/lamp.component');
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
      menu.style.right = '-50vw';
      this.toogleConfigMenu = false;
      this.toogleSettingsAnimate = false;
    }
  }

  handleSideBarMenu(): void {
    this.sideBarService.setSideBar(!this.toogleSideBarMenu);
  }
}


// import { AfterContentInit, AfterViewInit, Component, OnInit } from '@angular/core';

// // Icons
// import { MatIconModule } from '@angular/material/icon';


// import { CommonModule } from '@angular/common';
// import { LampComponent } from '../lamp/lamp.component';
// import { AnimationControllerService } from '../../service/animation-controller.service';
// import { DarkModeControllerService } from '../../service/dark-mode-controller.service';
// import { Text3dComponent } from "../text3d/text3d.component";
// import { SideMenuComponent } from '../side-menu/side-menu.component';
// import { SideBarMenuControllerService } from '../../service/side-bar-menu-controller.service';

// @Component({
//   selector: 'app-header',
//   standalone: true,
//   imports: [MatIconModule, CommonModule, LampComponent, Text3dComponent, SideMenuComponent],
//   templateUrl: './header.component.html',
//   styleUrl: './header.component.scss'
// })

// export class HeaderComponent implements OnInit, AfterViewInit {


//   public toogleConfigMenu: boolean = false;
//   public toogleSideBarMenu :boolean = false;

//   public toogleSettingsAnimate: boolean = false;

//   public readyToContent :boolean = false;

//   public toogleLamp: boolean = false;
//   public isDarkMode: boolean = true;
//   public toogleBtnDarkMode: boolean = true;

//   public toogleAnimations: boolean = true;
//   public toogleDarkMode :boolean = true;
  
//   constructor(
//     private animateService :AnimationControllerService,
//     private darkModeService :DarkModeControllerService,
//     private sideBarService :SideBarMenuControllerService
//   ){}

//   handleToogleLamp(){
//     this.toogleLamp = !this.toogleLamp;
//     this.toogleBtnDarkMode = !this.toogleBtnDarkMode;
//   }
//   handleToogleAnimations(){
//     this.animateService.setAnimations(!this.toogleAnimations);
//   }
//   handleMenuClick(): void {
//     const menu = document.querySelector("#configMenuContainer") as HTMLDivElement;

//     if(!this.toogleConfigMenu){
//       menu.style.right = "0vw"
//       this.toogleConfigMenu = true;
//       this.toogleSettingsAnimate = true;
//     }
//     else{
//       menu.style.right = "-50vw"
//       this.toogleConfigMenu = false;
//       this.toogleSettingsAnimate = false;
//     }
//   }
//   handleSideBarMenu():void {
//     this.sideBarService.setSideBar(!this.toogleSideBarMenu)
//   }

//   ngOnInit(): void {

//     this.animateService.getAnimationState().subscribe(state=>{
//       this.toogleAnimations = state;
//     });
//     this.darkModeService.getDarkModeState().subscribe(state=>{
//       this.toogleDarkMode= state;
//     });
//     this.sideBarService.getSideBarState().subscribe(state=>{
//       this.toogleSideBarMenu= state;
//     });

//   }

//   ngAfterViewInit(): void {
//     setTimeout(() => {
//       this.readyToContent = true;
//     }, 5000);
//   }
  
// }