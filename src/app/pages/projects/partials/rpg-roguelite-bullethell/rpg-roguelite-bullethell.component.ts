import { Component, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-rpg-roguelite-bullethell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './rpg-roguelite-bullethell.component.html',
  styleUrl: './rpg-roguelite-bullethell.component.scss'
})
export class RpgRogueliteBullethellComponent implements AfterViewInit, OnDestroy {

  private observer: IntersectionObserver | null = null;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.setupScrollAnimations();
  }

  private setupScrollAnimations(): void {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15 // Dispara quando 15% do elemento entra na tela
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Descomente a linha abaixo se quiser que a animação rode APENAS UMA VEZ
          // this.observer?.unobserve(entry.target); 
        } else {
          // Remove a classe para a animação repetir quando o usuário subir e descer a página
          entry.target.classList.remove('visible');
        }
      });
    }, options);

    // Busca todos os elementos que possuem as classes de reveal
    const hiddenElements = this.el.nativeElement.querySelectorAll('.reveal-up, .observe-me');
    hiddenElements.forEach((el: Element) => this.observer?.observe(el));
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

}
