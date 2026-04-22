import { Component, ComponentRef, Injector, OnDestroy, OnInit, ViewChild, ViewContainerRef, ChangeDetectorRef } from '@angular/core';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { CommonModule } from '@angular/common';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';

@Component({
  selector: 'app-config-menu',
  imports: [CommonModule],
  templateUrl: './config-menu.component.html',
  styleUrl: './config-menu.component.scss'
})
export class ConfigMenuComponent implements OnDestroy {
  @ViewChild('lampContainer', { read: ViewContainerRef, static: true }) lampContainer!: ViewContainerRef;

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
    private cdr: ChangeDetectorRef
  ){
    this.toggleAnimations$ = this.animationControllerService.getAnimationObserbable(); 
    this.toggleDarkMode$ = this.darkModeControllerService.getDarkModeObserbable();
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
  
  async loadLampComponent() {
    if (!this.toggleLamp && !this.lampComponentRef) {
      const { LampComponent } = await import('../../../../elements/lamp/lamp.component');
      
      this.lampComponentRef = this.lampContainer.createComponent(LampComponent, {
        injector: this.injector
      });
      this.cdr.detectChanges(); // Garante que a UI do menu reaja imediatamente e mostre o botão
    }
  }
  destroyLampComponent(){
    this.lampComponentRef.destroy();
    this.lampComponentRef = null as any;
    this.cdr.detectChanges(); // Atualiza a UI para remover o botão imediatamente
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
    return this.animationControllerService.getAnimationObserbable().pipe(take(1));
  }
  private toggleAnimationState() {
    this.getAnimationState().pipe( takeUntil(this.destroy$) )
    .subscribe(state=>{
      this.animationControllerService.setAnimations(!state);
    })
  }
  private executeWithAnimationState(callBack :(state :boolean)=> void){

    this.getAnimationState().pipe( takeUntil(this.destroy$) ).subscribe(animationState=>{   
      callBack(animationState);
    })

  }

  private getDarkModeState() :Observable<boolean>{
    return this.darkModeControllerService.getDarkModeObserbable().pipe(take(1));
  }
  private toggleDarkModeState(){
    this.getDarkModeState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state=>{
        this.darkModeControllerService.setDarkMode(!state);
      })
  }

}
