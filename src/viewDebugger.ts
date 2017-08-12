import * as PIXI from 'pixi.js';
import * as p2 from 'p2';
import IGameModel from './IGameModel';
import Constants from './constants';

export default class ViewDebugger {
    private thrustVectorX: PIXI.Graphics;
    private DeaccelVector: PIXI.Graphics;
    private aABBGraphics: PIXI.Graphics;
    private polygons: PIXI.Graphics

    constructor() {
        this.aABBGraphics = new PIXI.Graphics();
        this.polygons = new PIXI.Graphics();
    }

    public draw(stage:PIXI.Container, game:IGameModel):void {
        this.drawThrustVector(stage, game);
        this.drawDeaccelVector(stage, game);
        this.drawAABBs(stage, game);
        this.drawPolygons(stage, game);
    }

    public drawPolygons(stage:PIXI.Container, game:IGameModel):void {
        this.polygons.clear();
        this.polygons.lineStyle(5, 0x0000FF, 1);
        this.polygons.beginFill(0x000000, .25);

        for(let body of game.world.bodies) {
            let shapes:Array<p2.Shape> = body.shapes;
            
            for(let shape of shapes) {
                if(shape.type != p2.Shape.CONVEX) {
                    continue;
                } else {
                    let convex: p2.Convex = <p2.Convex>shape;
                    let angle: number= body.angle;
                    let posX: number = body.position[0];
                    let poxY: number = body.position[1];
                    
                    let vertices = convex.vertices;
                    for(let v in convex.vertices) {
                        let vert = p2.vec2.create();
                        p2.vec2.rotate(vert, vertices[v], angle);
                        let x = vert[0] + body.position[0];
                        let y = vert[1] + body.position[1];

                        if(v == '0') {
                            this.polygons.moveTo(x, y);
                        } else {
                            this.polygons.lineTo(x,y);
                        }
                    }
                }
            }
        }

        this.polygons.endFill();
        stage.addChild(this.polygons);
    }

    public drawAABBs(stage:PIXI.Container, game:IGameModel): void {
        this.aABBGraphics.clear();
        stage.removeChild(this.aABBGraphics);
        stage.addChild(this.aABBGraphics);
        this.aABBGraphics.lineStyle(5, 0x00FF00, 1);
        for(let i = 0; i < game.world.bodies.length; i++) {
            let body: p2.AABB = game.world.bodies[i].getAABB();
            this.aABBGraphics.drawRect(body.lowerBound[0], body.lowerBound[1], body.upperBound[0] - body.lowerBound[0], body.upperBound[1] - body.lowerBound[1]);
        }
    }

    public drawThrustVector(stage:PIXI.Container, game:IGameModel):void {
        if(this.thrustVectorX == null) {
            this.thrustVectorX = new PIXI.Graphics();
            this.thrustVectorX.beginFill(0xffffff);
            this.thrustVectorX.drawCircle(0,0,5);
            this.thrustVectorX.endFill();
            stage.addChild(this.thrustVectorX);
        }

        this.thrustVectorX.x = game.boat.position[0] -37;
        this.thrustVectorX.y = game.boat.position[1] -12.5;
    }

    public drawDeaccelVector(stage:PIXI.Container, game:IGameModel):void {
        if(this.DeaccelVector == null) {
            this.DeaccelVector = new PIXI.Graphics();
            this.DeaccelVector.beginFill(0xffff00);
            this.DeaccelVector.drawCircle(0,0,5);
            this.DeaccelVector.endFill();
            stage.addChild(this.DeaccelVector);
        }

        this.DeaccelVector.x = game.boat.position[0] + 37;
        this.DeaccelVector.y = game.boat.position[1] + 12.5;
    }
}