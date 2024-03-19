import { Component, OnDestroy, OnInit } from '@angular/core';
import Matter, { Engine, Render, World, Bodies, Constraint, Runner, MouseConstraint, Mouse, Svg, Common, Vertices, Vector, Query } from 'matter-js';

@Component({
  selector: 'app-lamp',
  standalone: true,
  templateUrl: './lamp.component.html',
  styleUrl: './lamp.component.scss'
})
export class LampComponent implements OnInit, OnDestroy {

  private engine: Matter.Engine | undefined;
  private render: Matter.Render | undefined;
  private runner: Matter.Runner | undefined;

  ngOnInit(): void {

    const engine = Engine.create();
    const runner = Runner.create();
    const render = Render.create({
      element: document.body,
      engine: engine,
      options: {
        width: 700,
        height: 400,
        wireframes: false,
        background: 'transparent',
      }
    });
    render.canvas.id = 'lampCanvas';
    console.log(render.canvas);
    

    engine.gravity.y = 0.5;
  
    const string = Bodies.rectangle(100, 1, 40, 8, {
      isStatic: true,
      render: {
        fillStyle: '#333',
        strokeStyle: 'black',
        lineWidth: 2
      }
    });

    let onOFfToogle = false;
    let lamp: Matter.Body

    const createLampWithConstraint = () =>{

      const svgImage = new Image();
      svgImage.src = onOFfToogle? '../../../assets/lamp-on.svg' : '../../../assets/lamp-off.svg' ;

      svgImage.onload = () => {
        lamp = this.createBodyFromSVGImage(svgImage, 0, 0, svgImage.width, svgImage.height);

        const constraint = Constraint.create({
          bodyA: lamp,
          pointA: { x: 0, y: svgImage.height / 2 }, // Ponto de conexão na lâmpada
          bodyB: string,
          pointB: { x: 0, y: 10 }, // Ponto de conexão na linha
          length: 300, // Comprimento inicial da corda (definido como um valor maior)
          stiffness: 0.1, // Rigidez da restrição (valor menor para tornar a corda mais mole)
          render: {
            strokeStyle: '#2e2e2e' // Cor da corda
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

          onOFfToogle = !onOFfToogle;
          let svgImage = new Image();
          svgImage.src = onOFfToogle ? '../../../assets/lamp-on.svg' : '../../../assets/lamp-off.svg';
          
          if (lamp.render && lamp.render.sprite && lamp.render.sprite.texture !== svgImage.src) {
            lamp.render.sprite.texture = svgImage.src;
          }
          
          console.log("click");
        }
      });
    });

  
    World.add(engine.world, mouseConstraint);
  
    // Executar a simulação
    Runner.run(runner, engine);
    Render.run(render);

    this.engine = engine;
    this.render = render;
    this.runner = runner;

    let canvas = document.querySelector("#lampCanvas") as HTMLCanvasElement
    canvas.style.position = "absolute"
    canvas.style.top = "0px"
    
  
  }

  ngOnDestroy(): void {

    console.log("destroyed");
    

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
    }
    
  }

  //Methods
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


}
