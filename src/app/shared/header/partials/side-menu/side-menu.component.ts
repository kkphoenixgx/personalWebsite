import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { ITitlesResponse } from '../../../../interface/ITitlesResponse'; 

import { SideBarMenuControllerService } from '../../../../services/side-bar-menu-controller.service';
import { FileNavigatorComponent } from './file-navigator/file-navigator.component';

@Component({
  selector: 'app-side-menu',
  standalone: true,
  imports: [CommonModule, FileNavigatorComponent],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss'
}) 
export class SideMenuComponent implements OnInit{
  public studyArray: ITitlesResponse = {
    response: [
      {
        tittle: 'Pasta 1',
        path: '/pasta1',
        response: [
          {
            tittle: 'Subpasta 1.1',
            path: '/pasta1/subpasta1',
            response: [
              'Arquivo 1.1.1',
              'Arquivo 1.1.2',
              {
                tittle: 'Subpasta 1.1.1',
                path: '/pasta1/subpasta1/subpasta1.1',
                response: [
                  'Arquivo 1.1.1.1',
                  'Arquivo 1.1.1.2',
                ]
              }
            ]
          },
          'Arquivo 1.2'
        ]
      },
      {
        tittle: 'Pasta 2',
        path: '/pasta2',
        response: [
          'Arquivo 2.1',
          {
            tittle: 'Subpasta 2.1',
            path: '/pasta2/subpasta2.1',
            response: ['Arquivo 2.1.1', 'Arquivo 2.1.2']
          }
        ]
      },
      'Arquivo 3'
    ]
  };

  public toogleSideBar :boolean = false;

  constructor(private sideBar :SideBarMenuControllerService){}

  public handleSideBarMenu(){
    this.sideBar.setSideBar(!this.sideBar)
  }


  ngOnInit(): void {

    this.sideBar.getSideBarState().subscribe(state=>{
      this.toogleSideBar = state;
    });

  }


}
