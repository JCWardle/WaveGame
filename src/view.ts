import * as PIXI from 'pixi.js';

export default class View {
    private renderer:PIXI.WebGLRenderer | PIXI.CanvasRenderer
    private stage:PIXI.Container;
    private WATER_HEIGHT: number = 20;
    private waterStart: number;

    constructor() {
        this.renderer = PIXI.autoDetectRenderer(window.innerWidth - 50, window.innerHeight - 50,
        {
            backgroundColor: 0x87ceeb
        });
        this.renderer.view.style.position = 'absolute';
        this.renderer.view.style.display = 'block';
        this.renderer.autoResize = true;
        this.renderer.resize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.view);

        this.waterStart = this.renderer.view.height - (this.renderer.view.height / this.WATER_HEIGHT);

        this.stage = new PIXI.Container();
        this.renderer.render(this.stage);
    }

    public render(): void {
        this.drawWater();

        this.drawPlayer();

        this.renderer.render(this.stage);
    }

    private drawWater(): void {
        let rectangle: PIXI.Graphics = new PIXI.Graphics();
        let rectangleHeight = this.renderer.view.height / this.WATER_HEIGHT;
        rectangle.beginFill(0x000080);
        rectangle.drawRect(0, 0, this.renderer.view.width, rectangleHeight);
        rectangle.endFill();
        rectangle.x = 0;
        rectangle.y = this.renderer.view.height - rectangleHeight;
        this.stage.addChild(rectangle);
    }

    private drawPlayer(): void {
        let boat: PIXI.Graphics = new PIXI.Graphics();
        boat.beginFill(0x00000);

        boat.drawPolygon([
            0, 0,
            50, 0,             
            74, -25,
            0, -25,
            0, 0
        ]);

        boat.endFill();
        boat.x = 180;
        boat.y = this.waterStart;

        this.stage.addChild(boat);
    }
}   