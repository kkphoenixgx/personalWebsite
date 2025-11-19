import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { IPage } from '../../../../interface/ITitlesResponse'; 

import { SideBarMenuControllerService } from '../../../../services/side-bar-menu-controller.service';
import { FileNavigatorComponent } from './file-navigator/file-navigator.component';
import { FileNavigatorService } from '../../../../services/file-navigator-service.service';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, FileNavigatorComponent],
  styleUrl: './side-menu.component.scss',
  templateUrl: './side-menu.component.html'
}) 
export class SideMenuComponent implements OnInit{

  public pagesResponse: IPage[] = [];
  public toogleSideBar :boolean = false;

  constructor(
    private sideBar :SideBarMenuControllerService,
    private fileNavigatorService :FileNavigatorService
  ){}

  public handleSideBarMenu(){
    this.sideBar.setSideBar(!this.sideBar)
  }


  ngOnInit(): void {

    this.sideBar.getSideBarState().subscribe(state=>{
      this.toogleSideBar = state;
    });

    this.fileNavigatorService.getItems().subscribe(items=>{
      console.log(items);
      if (items && items.length > 0) this.pagesResponse = items;
    });

  }

}
