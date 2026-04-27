import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';

import { IPage } from '../../../../interface/ITitlesResponse'; 

import { SideBarMenuControllerService } from '../../../../services/side-bar-menu-controller.service';
import { FileNavigatorComponent } from './file-navigator/file-navigator.component';
import { FileNavigatorService } from '../../../../services/file-navigator-service.service';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { RouterLink } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, FileNavigatorComponent, RouterLink, TranslateModule],
  styleUrl: './side-menu.component.scss',
  templateUrl: './side-menu.component.html'
}) 
export class SideMenuComponent implements OnInit{

  public pagesResponse: IPage[] = [];
  public toogleSideBar :boolean = false;
  public isDarkMode: boolean = true;
  public isAnimating: boolean = true;
  public isLoading: boolean = true;
  public hasError: boolean = false;

  private sideBar = inject(SideBarMenuControllerService);
  private fileNavigatorService = inject(FileNavigatorService);
  private darkModeService = inject(DarkModeControllerService);
  private animateService = inject(AnimationControllerService);

  public handleSideBarMenu(){
    this.sideBar.setSideBar(!this.toogleSideBar);
  }


  ngOnInit(): void {

    this.sideBar.getSideBarState().subscribe(state=>{
      this.toogleSideBar = state;
    });

    this.darkModeService.getDarkModeObserbable().subscribe(state => {
      this.isDarkMode = state;
    });

    this.animateService.getAnimationObserbable().subscribe(state => {
      this.isAnimating = state;
    });

    this.fileNavigatorService.getItems()
      .then(items => {
        if (items && items.length > 0) {
          this.pagesResponse = [{
            title: '🧠 Second brain notes',
            path: '',
            items: items
          }];
        }
        this.isLoading = false;
      })
      .catch(() => {
        this.hasError = true;
        this.isLoading = false;
      });

  }

}
