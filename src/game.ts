import * as p2 from 'p2';
import IGameModel from './IGameModel';
import Constants from './constants';
import IInput from './IInput';
import PolygonIntersection from './helpers/polygonIntersection';

export default class Game {
    private boat:p2.Body;
    private water:p2.Body;
    private world:p2.World;
    private inputs: IInput;
    private obstacle: p2.Body;
    private density: number = 5;
    private waterContactPairs: Array<ICollidingPair> = new Array<ICollidingPair>();

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
            this.waterUpdate();
        });

        this.world.on('beginContact', (event) => { this.beginContact(event); });

        this.world.on('endContact', (event) => { this.endContact(event); });
    }

    private waterUpdate(): void {
        for(let p of this.waterContactPairs) {
            let pair: ICollidingPair = <ICollidingPair> p;
            //Intersect is an array of polygons that intersec
            let intersect: number[][][] = PolygonIntersection.Intersection(pair.water, pair.body);

            if(intersect != null && intersect.length != 0) {
                let polygon: ICalculatedPolygon = this.polygonArea(intersect[0]);

                let displacedMass:number = pair.body.mass * polygon.area;
                let buoyancyForce:number[] = [0, 0];

                p2.vec2.scale(buoyancyForce, this.world.gravity, displacedMass);
                //Tranform world point to be body relative5
                let localCenter:number[] = [0,0];
                pair.body.toLocalFrame(localCenter, polygon.center);
                pair.body.applyForce(buoyancyForce, localCenter);
            }
        }
    }

    private beginContact(event:any):void {
        let pair : ICollidingPair;

        if(event.shapeA.sensor) {
            pair = {
                water: <p2.Body> event.bodyA,
                body: <p2.Body> event.bodyB
            };
        } else {
            pair = {
                water: <p2.Body> event.bodyB,
                body: <p2.Body> event.bodyA
            };
        }

        this.waterContactPairs.push(pair);
    }

    private endContact(event:any):void {
        let water: p2.Body;
        let object: p2.Body;

        if(event.shapeA.sensor) {
            this.waterContactPairs = this.waterContactPairs.filter((pair: ICollidingPair) => {
                return pair.body == event.bodyB && pair.water == event.bodyA;
            });
        } else {
            this.waterContactPairs = this.waterContactPairs.filter((pair: ICollidingPair) => {
                return pair.body == event.bodyA && pair.water == event.bodyB;
            });
        }
        console.log(this.waterContactPairs);
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

    //http://www.iforce2d.net/b2dtut/buoyancy
    private polygonArea(polygon:number[][]): ICalculatedPolygon {
        let e1: number[] = [0, 0];
        let e2: number[] = [0, 0];
        let result: ICalculatedPolygon = {
            area: 0,
            center: [0,0]
        };

        let referencePoint: number[] = [0, 0];

        for (let i = 0; i < polygon.length; i++) {
            let pos1 = referencePoint;
            let pos2 = polygon[i];            
            let pos3: number[];
            if(i + 1 < polygon.length) {
                pos3 = polygon[i + 1]
            } else {
                pos3 = polygon[0];
            }

            p2.vec2.subtract(e1, pos2, pos1);
            p2.vec2.subtract(e2, pos3, pos1);

            let cross: number = p2.vec2.crossLength(e1, e2);

            let area = 0.5 * cross;
            result.area += area;

            let centerOfThisTriangle: number[] = [0, 0];
            p2.vec2.centroid(centerOfThisTriangle, pos1, pos2, pos3);

            let scale: number[] = [0, 0];
            //Multiple area by center of the triangle
            p2.vec2.scale(scale, centerOfThisTriangle, area);

            let newCenter: number[] = [0, 0];
            p2.vec2.add(newCenter, result.center, scale);
            result.center = newCenter;
        }

        //Centroid
        if(result.area > Number.EPSILON) {
            let newCenter: number[] = [0, 0];
            p2.vec2.scale(newCenter, result.center, 1 / result.area);
            result.center = newCenter;
        } else {
            result.area = 0;
        }
        return result;
    }
}

export interface ICollidingPair {
    water: p2.Body,
    body: p2.Body
}

export interface ICalculatedPolygon {
    center: number[],
    area: number
}