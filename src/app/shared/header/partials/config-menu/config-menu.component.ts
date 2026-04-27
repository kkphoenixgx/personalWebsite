import { Component, ComponentRef, Injector, OnInit, OnDestroy, ViewChild, ViewContainerRef, ChangeDetectorRef, inject, ChangeDetectionStrategy, PLATFORM_ID } from '@angular/core';
import { AnimationControllerService } from '../../../../services/animation-controller.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Observable, Subject, take, takeUntil } from 'rxjs';
import { DarkModeControllerService } from '../../../../services/dark-mode-controller.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-config-menu',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './config-menu.component.html',
  styleUrl: './config-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfigMenuComponent implements OnInit, OnDestroy {
  @ViewChild('lampContainer', { read: ViewContainerRef, static: true }) lampContainer!: ViewContainerRef;

  private destroy$ = new Subject<void>();

  public toggleConfigMenu :boolean = false;

  private animationControllerService = inject(AnimationControllerService);
  private darkModeControllerService = inject(DarkModeControllerService);
  private injector = inject(Injector);
  private cdr = inject(ChangeDetectorRef);
  private translateService = inject(TranslateService);
  private platformId = inject(PLATFORM_ID);

  public toggleDarkMode$: Observable<boolean> = this.darkModeControllerService.getDarkModeObserbable();
  public toggleAnimations$: Observable<boolean> = this.animationControllerService.getAnimationObserbable();
  
  public toggleLamp = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public lampComponentRef!: ComponentRef<any>;
  public currentLang: string = 'en';

  // ----------- Lifecycle -----------

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.currentLang = localStorage.getItem('lang') || this.translateService.currentLang || 'en';
    } else {
      this.currentLang = this.translateService.currentLang || 'en';
    }

    this.translateService.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(event => {
      this.currentLang = event.lang;
      this.cdr.markForCheck(); // Avisa ao OnPush que a UI precisa atualizar
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ----------- Main methods -----------


  toggleMenuConfig(){
    this.toggleConfigMenu = !this.toggleConfigMenu;
    this.cdr.detectChanges(); // Força a atualização síncrona para não falhar ao abrir/fechar
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
  
  public toggleLanguage(): void {
    const newLang = this.currentLang === 'en' ? 'pt' : 'en';
    this.currentLang = newLang; // Atualiza a UI do botão imediatamente (remove lag visual)
    this.translateService.use(newLang);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('lang', newLang); // Salva na memória do usuário
    }
    this.cdr.detectChanges(); // Força a placa de vídeo a repintar o estado "active" do span
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
