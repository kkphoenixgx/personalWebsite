import { Component, ComponentRef, Injector, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { CommonModule } from '@angular/common';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { LampComponent } from '../../../../elements/lamp/lamp.component';

@Component({
  selector: 'app-config-menu',
  imports: [CommonModule],
  templateUrl: './config-menu.component.html',
  styleUrl: './config-menu.component.scss'
})
export class ConfigMenuComponent implements OnDestroy {
  @ViewChild('lampContainer', { read: ViewContainerRef }) lampContainer!: ViewContainerRef;

  private destroy$ = new Subject<void>();

  public toggleConfigMenu :boolean = false;

  public toggleDarkMode$ :Observable<boolean>
  public toggleAnimations$ :Observable<boolean>
  
  public toggleLamp = false;
  public lampComponentRef!: ComponentRef<any>;

  constructor( 
    private animationControllerService :AnimationControllerService, 
    private darkModeControllerService :DarkModeControllerService,
    private injector: Injector,
  ){
    this.toggleAnimations$ = this.animationControllerService.getAnimationState(); 
    this.toggleDarkMode$ = this.darkModeControllerService.getDarkModeState();
  }

  // ----------- Lifecycle -----------

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ----------- Main methods -----------


  toggleMenuConfig(){
    this.toggleConfigMenu = !this.toggleConfigMenu;
  } 

  executeWithAnimationState(callBack : (state :boolean )=> void ){

    this.getAnimationState().pipe( takeUntil(this.destroy$) ).subscribe(animationState=>{   
      callBack(animationState);
    })

  }
  
  async loadLampComponent() {
    if (!this.toggleLamp && !this.lampComponentRef) {
      const { LampComponent } = await import('../../../../elements/lamp/lamp.component');
      
      this.lampComponentRef = this.lampContainer.createComponent(LampComponent, {
        injector: this.injector
      });
    }
  }
  destroyLampComponent(){
    this.lampComponentRef.destroy();
    this.lampComponentRef = null as any;
  }

  // ----------- Helpers -----------

  handleToggleAnimations(){

    const destroyLampWhenAnimationOff = (state :boolean)=>{
      if(state && this.lampComponentRef) this.destroyLampComponent()
      
      this.toggleAnimationState();
    }

    this.executeWithAnimationState(destroyLampWhenAnimationOff)
    
  }

  handleToggleDarkMode() {
    
    //TODO: Handle lamp
    this.executeWithAnimationState( animationState=>{
      if(animationState){
        if(this.lampComponentRef) this.destroyLampComponent();
        else this.loadLampComponent();
      }
      else{
        this.toggleDarkModeState();
      }
    })
        
  }

  handleDestroyButton(){
    this.destroyLampComponent();
  }

  // ----------- Getters and Setters -----------

  private getAnimationState(): Observable<boolean> {
    return this.animationControllerService.getAnimationState().pipe(take(1));
  }
  
  private toggleAnimationState() {
    this.getAnimationState().pipe( takeUntil(this.destroy$) )
    .subscribe(state=>{
      this.animationControllerService.setAnimations(!state);
    })
  }

  private getDarkModeState() :Observable<boolean>{
    return this.darkModeControllerService.getDarkModeState().pipe(take(1));
  }
  private toggleDarkModeState(){
    this.getDarkModeState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state=>{
        this.darkModeControllerService.setDarkMode(!state);
      })
  }

}
