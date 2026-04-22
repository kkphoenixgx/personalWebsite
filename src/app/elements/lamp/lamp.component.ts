import { Component, OnDestroy, OnInit, AfterViewInit, Renderer2, ElementRef } from '@angular/core';
import Matter, { Engine, Render, World, Bodies, Constraint, Runner, MouseConstraint, Mouse, Query, Events } from 'matter-js';
import { DarkModeControllerService } from '../../services/dark-mode-controller.service';
import { Text3dService } from '../../services/text3d.service.service';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-lamp',
  standalone: true,
  templateUrl: './lamp.component.html'
})
export class LampComponent implements OnInit, AfterViewInit, OnDestroy {

  private engine: Matter.Engine | undefined;
  private render: Matter.Render | undefined;
  private runner: Matter.Runner | undefined;
  private lamp: Matter.Body | undefined;
  private mouse: Matter.Mouse | undefined;

  public isDarkMode: boolean = true;
  private rotationInterval: any;
  private destroy$ = new Subject<void>();

  constructor(
    private darkModeService: DarkModeControllerService,
    private text3dService: Text3dService,
    private rendererTwo: Renderer2,
    private el: ElementRef
  ) {}

  // ----------- LifeCycle Methods -----------

  ngOnInit(): void {
    this.initDarkModeSubscription();
  }

  ngAfterViewInit(): void {
    const canvas = this.setupCanvas();
    const { engine, runner, render } = this.initMatter(canvas);
    const string = this.createStringBody();

    this.setupLampAndConstraint(engine, string);
    this.setupMouseEvents(engine, render);
    this.setupMouseConstraint(engine, render);
    this.runEngineAndRender(engine, runner, render);
    this.storeEngineInstances(engine, runner, render);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.runner) Runner.stop(this.runner);
    if (this.mouse) Mouse.clearSourceEvents(this.mouse); // Remove os ouvintes globais e estanca o Leak de Memória
    if (this.engine) {
      World.clear(this.engine.world, false); // Limpa todos os corpos no mundo
      Engine.clear(this.engine); // Limpa o motor
    }
    if (this.render) {
      Render.stop(this.render); // Para o renderizador
      if (this.render.canvas && this.render.canvas.parentNode) {
        this.render.canvas.parentNode.removeChild(this.render.canvas); // Remove o canvas do DOM
      }
      this.render.textures = {};
      this.render.canvas.remove();
      this.render = undefined;
    }

    // Limpa o intervalo da rotação do texto
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.rotationInterval = null;
    }
  }

  // ----------- Initialization Methods -----------

  private initDarkModeSubscription(): void {
    this.darkModeService.getDarkModeObserbable().pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isDarkMode = state;
      });
  }
  
  private setupCanvas(): HTMLCanvasElement {
    const canvas = this.rendererTwo.createElement('canvas');
    
    // Anexa diretamente ao body da página para evitar que o canvas fique preso 
    // em filtros (filters), transforms ou z-index ocultos dos componentes pai.
    this.rendererTwo.appendChild(document.body, canvas);
    
    this.rendererTwo.setStyle(canvas, 'position', 'fixed');
    this.rendererTwo.setStyle(canvas, 'top', '0px');
    this.rendererTwo.setStyle(canvas, 'left', '0vw'); // Desloca para aparecer seguramente no quadrante esquerdo
    this.rendererTwo.setStyle(canvas, 'z-index', '9999'); // Força a sobreposição sobre tudo
    this.rendererTwo.setStyle(canvas, 'pointer-events', 'auto');

    return canvas;
  }

  private initMatter(canvas: HTMLCanvasElement): { engine: Matter.Engine, runner: Matter.Runner, render: Matter.Render } {
    const engine = Engine.create();
    const runner = Runner.create();
    const render = Render.create({
      engine: engine,
      canvas: canvas,
      options: {
        width: 700,
        height: 1000,
        wireframes: false,
        background: 'transparent'
      }
    });
    render.canvas.id = 'lampCanvas';
    engine.gravity.y = 0.5;
    return { engine, runner, render };
  }

  private createStringBody(): Matter.Body {
    return Bodies.rectangle(200, 1, 40, 8, {
      isStatic: true,
      render: {
        fillStyle: '#333',
        strokeStyle: 'black',
        lineWidth: 2
      }
    });
  }

  private setupLampAndConstraint(engine: Matter.Engine, string: Matter.Body): void {
    this.executeWithDarkModeState((state: boolean) => {
      const svgImage = new Image();
      svgImage.src = state ? 'assets/lamp-off.svg' : 'assets/lamp-on.svg';
      const onLoadHandler = () => {
        const w = svgImage.width || 50;
        const h = svgImage.height || 100;
        
        // Nasce a lâmpada deslocada para a direita (x: 350) e no alto (y: 50) para a gravidade criar o balanço natural
        this.lamp = this.createBodyFromSVGImage(svgImage, 350, 50, w, h);
        const constraint = Constraint.create({
          bodyA: this.lamp,
          pointA: { x: 0, y: h / 2 }, // Y Negativo para amarrar o fio no TOPO da lâmpada!
          bodyB: string,
          pointB: { x: 0, y: 10 },
          length: 170,
          stiffness: 0.1,
          render: {
            strokeStyle: '#2e2e2e'
          }
        });
        World.add(engine.world, [this.lamp as unknown as Matter.Body, string, constraint]);
      };

      svgImage.onload = onLoadHandler;
      svgImage.onerror = () => {
        console.warn("Failed to load lamp SVG. Creating fallback body.");
        onLoadHandler();
      };
    });
  }

  private setupMouseEvents(engine: Matter.Engine, render: Matter.Render): void {
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    
    const handleInput = (x: number, y: number) => {
      const mousePosition = { x, y };
      const bodiesUnderMouse = Query.point(engine.world.bodies, mousePosition);
      bodiesUnderMouse.forEach((body) => {
        this.executeWithDarkModeState((state: boolean) => {
          if (body === this.lamp) {
            state = !state;
            const svgImage = new Image();
            svgImage.src = state ? 'assets/lamp-off.svg' : 'assets/lamp-on.svg';
            if (this.lamp && this.lamp.render && this.lamp.render.sprite && this.lamp.render.sprite.texture !== svgImage.src) {
              this.lamp.render.sprite.texture = svgImage.src;
            }
            this.toogleDarkMode();
            this.startTextRotation();
            console.log("click");
          }
        });
      });
    };

    render.canvas.addEventListener("click", (event: MouseEvent) => {
      const rect = render.canvas.getBoundingClientRect();
      handleInput(event.clientX - rect.left, event.clientY - rect.top);
    });
    
    render.canvas.addEventListener("touchstart", (event: TouchEvent) => {
      const touch = event.touches[0];
      touchStartTime = Date.now();
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    });

    render.canvas.addEventListener("touchend", (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      const touchEndTime = Date.now();
      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;

      const duration = touchEndTime - touchStartTime;
      const distance = Math.sqrt(Math.pow(touchEndX - touchStartX, 2) + Math.pow(touchEndY - touchStartY, 2));

      // Considera como click se foi rápido (<300ms) e não moveu muito (<10px)
      if (duration < 300 && distance < 10) {
        const rect = render.canvas.getBoundingClientRect();
        handleInput(touchEndX - rect.left, touchEndY - rect.top);
      }
    });
  }

  private setupMouseConstraint(engine: Matter.Engine, render: Matter.Render): void {
    this.mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: this.mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });
    World.add(engine.world, mouseConstraint);
  }

  private runEngineAndRender(engine: Matter.Engine, runner: Matter.Runner, render: Matter.Render): void {
    // Injeta a lógica de luz customizada no ciclo de renderização nativo do Canvas
    Events.on(render, 'afterRender', () => {
      if (!this.lamp) return;

      const ctx = render.context;
      const { x, y } = this.lamp.position;
      const glowY = y + 15; // Desloca o brilho um pouco para baixo, focando no bulbo de vidro da lâmpada
      
      ctx.save();
      ctx.beginPath();
      
      const isOff = this.isDarkMode;
      const radius = isOff ? 40 : 100;
      const gradient = ctx.createRadialGradient(x, glowY, 5, x, glowY, radius);
      
      if (isOff) {
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(255, 220, 50, 0.5)'); // Amarelo vibrante
        gradient.addColorStop(1, 'rgba(255, 220, 50, 0)');
      }
      
      ctx.fillStyle = gradient;
      ctx.arc(x, glowY, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    });

    Runner.run(runner, engine);
    Render.run(render);
  }

  private storeEngineInstances(engine: Matter.Engine, runner: Matter.Runner, render: Matter.Render): void {
    this.engine = engine;
    this.runner = runner;
    this.render = render;
  }

  // ----------- Main Methods -----------

  createBodyFromSVGImage(svgImage: HTMLImageElement, x: number, y: number, width: number, height: number): Matter.Body {
    const body = Bodies.rectangle(x, y, width, height, {
      render: {
        sprite: {
          texture: svgImage.src,
          xScale: 1,
          yScale: 1
        }
      }
    });
    return body;
  }

  // ----------- Helpers -----------

  toogleDarkMode(): void {
    this.toggleDarkModeState();
  }

  private startTextRotation(): void {
    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.text3dService.resetRotationProgress();
    }
    this.rotationInterval = setInterval(() => {
      this.text3dService.rotateTextOnce(0.5); // Ajuste a velocidade conforme necessário
    }, 50);
  }

  executeWithDarkModeState(callback: (state: boolean) => void): void {
    this.getDarkModeStateOnce().pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        callback(state);
      });
  }

  private getDarkModeStateOnce(): Observable<boolean> {
    return this.darkModeService.getDarkModeObserbable().pipe(take(1));
  }
  
  private toggleDarkModeState(): void {
    this.getDarkModeStateOnce().pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.darkModeService.setDarkMode(!state);
      });
  }
}