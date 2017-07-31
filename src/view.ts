/// <reference path="../PIXI.d.ts" />

import * as PIXI from 'pixi.js';
import IGameModel from './gameModel';

export default class View {
    private container:PIXI.Container;
    private WATER_HEIGHT: number = 20;
    private widthScale: number;
    private heightScale: number;
    private waterStart: number;
    private boat: PIXI.Graphics;
    private application: PIXI.Application;

    private HEIGHT: number = 1080
    private WIDTH: number = 1920;

    constructor() {
        this.application = new PIXI.Application(window.innerWidth, window.innerHeight,
        {
            backgroundColor: 0x87ceeb
        });
        this.application.view.style.position = 'absolute';
        this.application.view.style.display = 'block';
        document.body.appendChild(this.application.view);

        this.waterStart = this.application.view.height - (this.application.view.height / this.WATER_HEIGHT);

        this.container = new PIXI.Container();

        this.sizeStage();

        window.addEventListener("resize", () => {
            this.sizeStage();
        });

        window.onresize = () => {
            this.sizeStage();
        };
        
        this.application.stage.addChild(this.container);
        this.application.render();

        this.boat = new PIXI.Graphics();
        this.boat.beginFill(0x00000);

        this.boat.drawPolygon([
            0, 0,
            50, 0,             
            74, -25,
            0, -25,
            0, 0
        ]);

        this.boat.endFill();
    }

    public render(model: IGameModel): void {
        this.drawWater();

        this.drawPlayer(model);

        this.application.render();
    }

    private drawWater(): void {
        let rectangle: PIXI.Graphics = new PIXI.Graphics();
        let rectangleHeight = 1;
        rectangle.beginFill(0x000080);
        rectangle.drawRect(-50, -50, 100, 100);
        rectangle.endFill();
        rectangle.x = 0;
        rectangle.y = 0;
        this.container.addChild(rectangle);
    }

    private drawPlayer(model: IGameModel): void {
        this.boat.x = model.boat.position[0];
        this.boat.y = model.boat.position[1];
        this.boat.rotation = model.boat.angle;
    }

    private sizeStage() : void {
        this.widthScale = window.innerWidth / this.WIDTH;
        this.heightScale = window.innerWidth / this.HEIGHT;
        this.container.position.x =  this.application.renderer.width / 2; // center at origin
        this.container.position.y =  this.application.renderer.height / 2;
        this.container.scale.y = -this.heightScale; //Make up, up
        this.container.scale.x = this.widthScale;
        this.application.renderer.resize(window.innerWidth, window.innerHeight);
    }
}   