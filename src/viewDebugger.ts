import * as PIXI from 'pixi.js';
import IGameModel from './gameModel';
import Constants from './constants';

export default class ViewDebugger {
    private thrustVectorX: PIXI.Graphics;
    private thrustVectorY: PIXI.Graphics;
    private aABBGraphics: PIXI.Graphics;

    constructor() {
        this.aABBGraphics = new PIXI.Graphics();
    }

    public draw(stage:PIXI.Container, game:IGameModel):void {
        this.drawThrustVectorX(stage, game);
        this.drawThrustVectorY(stage, game);
        this.drawAABBs(stage, game);
    }

    public drawAABBs(stage:PIXI.Container, game:IGameModel): void {
        this.aABBGraphics.clear();
        stage.removeChild(this.aABBGraphics);
        stage.addChild(this.aABBGraphics);
        this.aABBGraphics.lineStyle(5, 0x00FF00, 1);
        for(let i = 0; i < game.world.bodies.length; i++) {
            let body = game.world.bodies[i].getAABB();
            this.aABBGraphics.drawRect(body.lowerBound[0], body.lowerBound[1], body.upperBound[0] - body.lowerBound[0], body.upperBound[1] - body.lowerBound[1]);
        }
    }

    public drawThrustVectorX(stage:PIXI.Container, game:IGameModel):void {
        if(this.thrustVectorX == null) {
            this.thrustVectorX = new PIXI.Graphics();
            this.thrustVectorX.beginFill(0xffffff);
            this.thrustVectorX.drawCircle(0,0,5);
            this.thrustVectorX.endFill();
            stage.addChild(this.thrustVectorX);
        }

        this.thrustVectorX.x = game.boat.position[0];
        this.thrustVectorX.y = game.boat.position[1];
    }

    public drawThrustVectorY(stage:PIXI.Container, game:IGameModel):void {
        if(this.thrustVectorY == null) {
            this.thrustVectorY = new PIXI.Graphics();
            this.thrustVectorY.beginFill(0xffff00);
            this.thrustVectorY.drawCircle(0,0,5);
            this.thrustVectorY.endFill();
            stage.addChild(this.thrustVectorY);
        }

        this.thrustVectorY.x = game.boat.position[0] + 60;
        this.thrustVectorY.y = game.boat.position[1] + 20;
    }
}