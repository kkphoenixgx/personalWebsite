import { Component, ElementRef, HostListener, ViewChild, inject, OnInit, OnDestroy } from '@angular/core';
import { TheEyeControllerService } from '../../../../../../services/the-eye-controller.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-the-eye',
  imports: [],
  templateUrl: './the-eye.component.html',
  styleUrl: './the-eye.component.scss'
})
export class TheEyeComponent implements OnInit, OnDestroy {
  @ViewChild('eyeContainer') eyeContainer!: ElementRef;

  private theEyeControllerService = inject(TheEyeControllerService);
  private angrySubscription!: Subscription;

  public pupilTransform: string = 'translate(0px, 0px)';
  public isAngry: boolean = false;

  private lastClientX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
  private lastClientY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

  ngOnInit(): void {
    this.angrySubscription = this.theEyeControllerService.getAngryObservable().subscribe(state => {
      this.isAngry = state;
    });
  }

  ngOnDestroy(): void {
    if (this.angrySubscription) this.angrySubscription.unsubscribe();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.lastClientX = event.clientX;
    this.lastClientY = event.clientY;
    this.updateEyePosition();
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (event.touches.length > 0) {
      this.lastClientX = event.touches[0].clientX;
      this.lastClientY = event.touches[0].clientY;
      this.updateEyePosition();
    }
  }

  @HostListener('window:scroll', [])
  onScroll() {
    this.updateEyePosition();
  }

  private updateEyePosition() {
    if (!this.eyeContainer || this.isAngry) return;

    // Pega as dimensões reais e a posição do olho na tela
    const eyeRect = this.eyeContainer.nativeElement.getBoundingClientRect();
    const eyeCenterX = eyeRect.left + eyeRect.width / 2;
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;

    // Distância entre o mouse/touch e o centro do olho
    const deltaX = this.lastClientX - eyeCenterX;
    const deltaY = this.lastClientY - eyeCenterY;

    // Calcula o ângulo (em radianos) usando atan2
    const angle = Math.atan2(deltaY, deltaX);

    // Define o limite máximo que a pupila pode se afastar do centro (raios da elipse)
    const maxRadiusX = 10; 
    const maxRadiusY = 6;

    // Cria um rácio suave para a pupila não bater na borda instantaneamente
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const ratio = Math.min(distance / 200, 1); // A pupila encosta na borda quando o cursor estiver a 200px de distância

    const pupilX = Math.cos(angle) * maxRadiusX * ratio;
    const pupilY = Math.sin(angle) * maxRadiusY * ratio;

    this.pupilTransform = `translate(${pupilX}px, ${pupilY}px)`;
  }

  onClick() {
    if (this.isAngry) return; // Não dispara se já estiver irritado
    this.theEyeControllerService.setAngry(true);
    setTimeout(() => {
      this.theEyeControllerService.setAngry(false);
    }, 2500); // Fica irritado por 2.5 segundos
  }
}
