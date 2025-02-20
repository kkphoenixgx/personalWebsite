import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import Matter, { Engine, Render, World, Bodies, Constraint, Runner, MouseConstraint, Mouse, Query } from 'matter-js';
import { DarkModeControllerService } from '../../services/dark-mode-controller.service'; 
import { Text3dService } from '../../services/text3d.service.service'; 

@Component({
  selector: 'app-lamp',
  standalone: true,
  templateUrl: './lamp.component.html',
  styleUrls: ['./lamp.component.scss']
})
export class LampComponent implements OnInit, OnDestroy {

  private engine: Matter.Engine | undefined;
  private render: Matter.Render | undefined;
  private runner: Matter.Runner | undefined;

  public isDarkMode: boolean = true;
  private rotationInterval: any; // Para controlar a rotação do texto

  constructor(
    private darkModeService: DarkModeControllerService,
    private text3dService: Text3dService,
    private rendererTwo :Renderer2
  ) {}

  toogleDarkMode() {    
    this.darkModeService.setDarkMode(!this.isDarkMode);
  }

  createBodyFromSVGImage(svgImage: HTMLImageElement, x: number, y: number, width: number, height: number) {
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

  private startTextRotation() {

    if (this.rotationInterval) {
      clearInterval(this.rotationInterval);
      this.text3dService.resetRotationProgress();
    }

    this.rotationInterval = setInterval(() => {
      this.text3dService.rotateTextOnce(0.5); // Ajuste a velocidade conforme necessário
    }, 50);
}


  ngOnInit(): void {
    // on init lampcomponent

    this.darkModeService.getDarkModeState().subscribe(state => {
      this.isDarkMode = state;
    });

    // ----------- Lamp -----------

    const canvas = this.rendererTwo.createElement('canvas');
    const canvasContainer = document.querySelector('#canvas-container');
    this.rendererTwo.appendChild(canvasContainer, canvas);
    this.rendererTwo.setStyle(canvas, 'position','absolute');
    this.rendererTwo.setStyle(canvas, 'top', '0px');
    

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
        background: 'transparent',
      }
    });

    render.canvas.id = 'lampCanvas';

    engine.gravity.y = 0.5;

    const string = Bodies.rectangle(100, 1, 40, 8, {
      isStatic: true,
      render: {
        fillStyle: '#333',
        strokeStyle: 'black',
        lineWidth: 2
      }
    });

    let onOffToggle = false;
    let lamp: Matter.Body;

    const createLampWithConstraint = () => {
      const svgImage = new Image();
      svgImage.src = onOffToggle ? 'assets/lamp-on.svg' : 'assets/lamp-off.svg';

      svgImage.onload = () => {
        lamp = this.createBodyFromSVGImage(svgImage, 0, 0, svgImage.width, svgImage.height);

        const constraint = Constraint.create({
          bodyA: lamp,
          pointA: { x: 0, y: svgImage.height / 2 },
          bodyB: string,
          pointB: { x: 0, y: 10 },
          length: 170,
          stiffness: 0.1,
          render: {
            strokeStyle: '#2e2e2e'
          }
        });
      
        World.add(engine.world, [lamp as unknown as Matter.Body, string, constraint]);
      };
    }

    createLampWithConstraint();

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

    // Click em objetos
    render.canvas.addEventListener("click", (event) => {
      const mousePosition = {
        x: event.clientX - render.canvas.getBoundingClientRect().left,
        y: event.clientY - render.canvas.getBoundingClientRect().top
      };
      const bodiesUnderMouse = Query.point(engine.world.bodies, mousePosition);

      bodiesUnderMouse.forEach((body) => {
        if (body === lamp) {
          onOffToggle = !onOffToggle;
          let svgImage = new Image();
          svgImage.src = onOffToggle ? '../../../assets/lamp-on.svg' : '../../../assets/lamp-off.svg';
          
          if (lamp.render && lamp.render.sprite && lamp.render.sprite.texture !== svgImage.src) {
            lamp.render.sprite.texture = svgImage.src;
          }

          this.toogleDarkMode();
          
          // Rotaciona o texto quando a lâmpada é clicada
          this.startTextRotation(); 
          
          console.log("click");
        }
      });
    });

    World.add(engine.world, mouseConstraint);

    Runner.run(runner, engine);
    Render.run(render);

    this.engine = engine;
    this.render = render;
    this.runner = runner;
    
  }

  ngOnDestroy(): void {
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
}
