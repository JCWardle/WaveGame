import * as p2 from 'p2';
import IGameModel from './IGameModel';
import Constants from './constants';
import IInput from './IInput';

export default class Game {
    private boat:p2.Body;
    private water:p2.Body;
    private world:p2.World;
    private inputs: IInput;
    private obstacle: p2.Body;
    private waterContactPairs: Array<ICollidingPair>;

    constructor() {
        this.world = new p2.World({
            gravity: [0, -100]
        });        
        
        // Create "water surface"
        this.water = new p2.Body({
            position:[0, -(Constants.HEIGHT / 2) + Constants.WATER_HEIGHT],
            collisionResponse: false
        });
        this.water.addShape(new p2.Plane({sensor: true}));
        this.world.addBody(this.water);

        this.boat = new p2.Body({
            mass: 1.3,
            position: [0, -(Constants.HEIGHT / 2) + Constants.WATER_HEIGHT + 30],
            angularVelocity: 0
        });
        
        this.boat.fromPolygon(this.convertVertices(Constants.BOAT_VERTICES));
        this.world.addBody(this.boat);

        this.obstacle = new p2.Body({
            mass: .1,
            position: [250, -(Constants.HEIGHT / 2) + Constants.WATER_HEIGHT + 100],
            angle: 45
        });

        this.obstacle.addShape(new p2.Box({ height: 100, width: 100 }));
        this.world.addBody(this.obstacle);

        this.world.on('postStep', () => {
            this.moveBoat();            
        });

        this.world.on('beginContact', (event:any) => {
            let water: p2.Body;
            let object: p2.Body;

            if(event.shapeA.sensor) {
                this.waterContactPairs.push({
                    water: <p2.Body> event.bodyA,
                    body: <p2.Body> event.bodyB
                });
            } else {
                this.waterContactPairs.push({
                    water: <p2.Body> event.bodyB,
                    body: <p2.Body> event.bodyA
                });
            }
        });

        this.world.on('endContact', (event:any) => {
            let water: p2.Body;
            let object: p2.Body;

            if(event.shapeA.sensor) {
                this.waterContactPairs = this.waterContactPairs.filter((pair: ICollidingPair) => {
                    pair.body != event.bodyB && pair.water != event.bodyA
                });
            } else {
                this.waterContactPairs = this.waterContactPairs.filter((pair: ICollidingPair) => {
                    pair.body != event.bodyA && pair.water != event.bodyB
                });
            }
        });
    }

    private convertVertices(toConvert: number[]): number[][] {
        let result: number[][] = [];
        let x:number = null;
        for(let i = 0; i < toConvert.length; i++){
            if(x == null) {
                x = toConvert[i];
            } else {
                let y:number = toConvert[i];
                result.push([x, y]);
                x = null;
            }
        }

        result.length = result.length - 1;
        return result;
    }

    private moveBoat(): void {
        if(this.inputs.move && this.boat.position[0] < Constants.MAX_BOAT_X && this.boat) {
            this.boat.applyForce([400, 0], [-37, -12.5]); // X movement
            //this.boat.applyForce([0, 40], [60,20]); // Y movement
        } else if (this.boat.position[0] > Constants.MAX_BOAT_X || !this.inputs.move) { 
            //this.boat.applyForce([-200, 0], [37, 0]); // X movement
            //this.boat.applyForce([0, -20], [60,20]); // Y movement
        }
    }

    public update(t: number, deltaTime:number, inputs: IInput): IGameModel {
        this.inputs = inputs;

        this.world.step(t, deltaTime, 10);

        return {
            boat: this.boat,
            debug: this.inputs.debug,
            world: this.world,
            water: this.water
        };
    }
}

export interface ICollidingPair {
    water: p2.Body,
    body: p2.Body
}