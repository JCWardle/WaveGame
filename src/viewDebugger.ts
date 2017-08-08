import * as PIXI from 'pixi.js';
import IGameModel from './gameModel';
import Constants from './constants';

export default class ViewDebugger {
    private thrustVector: PIXI.Graphics;

    constructor() {}

    public draw(stage:PIXI.Container, game:IGameModel):void {
        this.drawThrustVector(stage, game);
    }

    public drawThrustVector(stage:PIXI.Container, game:IGameModel):void {
        if(this.thrustVector == null) {
            this.thrustVector = new PIXI.Graphics();
            this.thrustVector.beginFill(0xffffff);
            this.thrustVector.drawCircle(0,0,5);
            this.thrustVector.endFill();
            stage.addChild(this.thrustVector);
        }

        this.thrustVector.x = game.boat.position[0] - 10;
        this.thrustVector.y = game.boat.position[1] - 10;
    }
}