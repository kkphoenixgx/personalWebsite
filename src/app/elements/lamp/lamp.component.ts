import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import Matter, { Engine, Render, World, Bodies, Constraint, Runner, MouseConstraint, Mouse, Query } from 'matter-js';
import { DarkModeControllerService } from '../../services/dark-mode-controller.service';
import { Text3dService } from '../../services/text3d.service.service';
import { Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-lamp',
  standalone: true,
  templateUrl: './lamp.component.html'
})
export class LampComponent implements OnInit, OnDestroy {

  private engine: Matter.Engine | undefined;
  private render: Matter.Render | undefined;
  private runner: Matter.Runner | undefined;
  private lamp: Matter.Body | undefined;

  public isDarkMode: boolean = true;
  private rotationInterval: any; // Para controlar a rotação do texto
  private destroy$ = new Subject<void>();

  constructor(
    private darkModeService: DarkModeControllerService,
    private text3dService: Text3dService,
    private rendererTwo: Renderer2
  ) {}

  // ----------- LifeCycle Methods -----------

  ngOnInit(): void {
    this.initDarkModeSubscription();

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
    this.darkModeService.getDarkModeState().pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isDarkMode = state;
      });
  }

  private setupCanvas(): HTMLCanvasElement {
    const canvas = this.rendererTwo.createElement('canvas');
    const canvasContainer = document.querySelector('#canvas-container');
    this.rendererTwo.appendChild(canvasContainer, canvas);
    this.rendererTwo.setStyle(canvas, 'position', 'absolute');
    this.rendererTwo.setStyle(canvas, 'top', '0px');
    return canvas;
  }

  private initMatter(canvas: HTMLCanvasElement): { engine: Matter.Engine, runner: Matter.Runner, render: Matter.Render } {
    const engine = Engine.create();
    const runner = Runner.create();
    const render = Render.create({
      element: document.body,
      engine: engine,
      canvas: canvas,
      options: {
        width: 700,
        height: 300,
        wireframes: false,
        background: 'transparent'
      }
    });
    render.canvas.id = 'lampCanvas';
    engine.gravity.y = 0.5;
    return { engine, runner, render };
  }

  private createStringBody(): Matter.Body {
    return Bodies.rectangle(100, 1, 40, 8, {
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
      svgImage.onload = () => {
        this.lamp = this.createBodyFromSVGImage(svgImage, 0, 0, svgImage.width, svgImage.height);
        const constraint = Constraint.create({
          bodyA: this.lamp,
          pointA: { x: 0, y: svgImage.height / 2 },
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
    });
  }

  private setupMouseEvents(engine: Matter.Engine, render: Matter.Render): void {
    render.canvas.addEventListener("click", (event: MouseEvent) => {
      const rect = render.canvas.getBoundingClientRect();
      const mousePosition = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
      const bodiesUnderMouse = Query.point(engine.world.bodies, mousePosition);
      bodiesUnderMouse.forEach((body) => {
        this.executeWithDarkModeState((state: boolean) => {
          if (body === this.lamp) {
            state = !state;
            const svgImage = new Image();
            svgImage.src = state ? '../../../assets/lamp-off.svg' : '../../../assets/lamp-on.svg';
            if (this.lamp && this.lamp.render && this.lamp.render.sprite && this.lamp.render.sprite.texture !== svgImage.src) {
              this.lamp.render.sprite.texture = svgImage.src;
            }
            this.toogleDarkMode();
            this.startTextRotation();
            console.log("click");
          }
        });
      });
    });
  }

  private setupMouseConstraint(engine: Matter.Engine, render: Matter.Render): void {
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
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
    return this.darkModeService.getDarkModeState().pipe(take(1));
  }
  
  private toggleDarkModeState(): void {
    this.getDarkModeStateOnce().pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.darkModeService.setDarkMode(!state);
      });
  }
}