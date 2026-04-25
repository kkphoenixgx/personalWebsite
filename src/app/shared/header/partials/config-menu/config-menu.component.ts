import { Component, ComponentRef, Injector, OnDestroy, ViewChild, ViewContainerRef, ChangeDetectorRef, inject } from '@angular/core';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { CommonModule } from '@angular/common';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';

@Component({
  selector: 'app-config-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './config-menu.component.html',
  styleUrl: './config-menu.component.scss'
})
export class ConfigMenuComponent implements OnDestroy {
  @ViewChild('lampContainer', { read: ViewContainerRef, static: true }) lampContainer!: ViewContainerRef;

  private destroy$ = new Subject<void>();

  public toggleConfigMenu :boolean = false;

  private animationControllerService = inject(AnimationControllerService);
  private darkModeControllerService = inject(DarkModeControllerService);
  private injector = inject(Injector);
  private cdr = inject(ChangeDetectorRef);

  public toggleDarkMode$: Observable<boolean> = this.darkModeControllerService.getDarkModeObserbable();
  public toggleAnimations$: Observable<boolean> = this.animationControllerService.getAnimationObserbable();
  
  public toggleLamp = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public lampComponentRef!: ComponentRef<any>;

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
    if (this.lampComponentRef) {
      this.lampComponentRef.destroy();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.lampComponentRef = null as any;
      this.cdr.detectChanges(); // Atualiza a UI para remover o botão imediatamente
    }
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
