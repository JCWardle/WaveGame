import * as PIXI from 'pixi.js';
import IGameModel from './IGameModel';
import ViewDebugger from './viewDebugger';
import Constants from './constants';

export default class View {
    private container:PIXI.Container;
    private widthScale: number;
    private heightScale: number;
    private boat: PIXI.Sprite;
    private water: PIXI.Graphics;
    private application: PIXI.Application;
    private debugger: ViewDebugger;

    constructor() {
        this.debugger = new ViewDebugger();
        this.application = new PIXI.Application(window.innerWidth, window.innerHeight,
        {
            backgroundColor: 0x87ceeb
        });
        this.application.view.style.position = 'absolute';
        this.application.view.style.display = 'block';
        document.body.appendChild(this.application.view);

        this.container = new PIXI.Container();

        this.sizeStage();

        window.addEventListener("resize", () => {
            this.sizeStage();
        });

        window.onresize = () => {
            this.sizeStage();
        };
        
        this.application.stage.addChild(this.container);
        this.drawBoat();
        this.application.render();
    }

    public render(model: IGameModel): void {
        this.drawPlayer(model);
        this.drawWater(model)

        if(model.debug) {
            this.debugger.draw(this.container, model);
        }

        this.application.render();
    }

    private drawBoat(): void {
        this.boat = PIXI.Sprite.fromImage('assets/boat.png');
        this.boat.anchor.set(0.5, 0.5);
        this.boat.width = 84;
        this.boat.height = 35;
        this.boat.scale.y = -1;
        this.container.addChild(this.boat);
    }

    private drawWater(model: IGameModel): void {
        if(this.water == null) {
            this.water = new PIXI.Graphics();
            this.water.beginFill(0x000080, 0.75);
            this.water.drawRect(model.water.position[0] - (Constants.WIDTH / 2), model.water.position[1], Constants.WIDTH, -Constants.WATER_HEIGHT);
            this.water.endFill();
            this.container.addChild(this.water);
        }
    }

    private drawPlayer(model: IGameModel): void {
        this.boat.x = model.boat.position[0];
        this.boat.y = model.boat.position[1];
        this.boat.rotation = model.boat.angle;
    }

    private sizeStage() : void {
        this.widthScale = window.innerWidth / Constants.WIDTH;
        this.heightScale = window.innerHeight / Constants.HEIGHT;
        this.container.position.x =  this.application.renderer.width / 2; // center at origin
        this.container.position.y =  this.application.renderer.height / 2;
        this.container.scale.y = -this.heightScale; //Make up, up
        this.container.scale.x = this.widthScale;

        this.application.renderer.resize(window.innerWidth, window.innerHeight);

        if(this.water != null){
            this.water.width = this.container.width;
        }
    }
}   