import * as p2 from 'p2';
import IGameModel from './gameModel';
import Constants from './constants';
import IInput from './IInput';

export default class Game {
    private boat:p2.Body;
    private world:p2.World;
    private k = 100; // up force per submerged "volume"
    private viscosity = 0.5; // viscosity
    private inputs: IInput;

    constructor() {
        this.world = new p2.World({
            gravity: [0, -100]
        });        
        
        // Create "water surface"
        let plane: p2.Body = new p2.Body({
            position:[0, -(Constants.HEIGHT / 2) + Constants.WATER_HEIGHT]
        });
        plane.addShape(new p2.Plane());
        this.world.addBody(plane);

        this.boat = new p2.Body({
            mass: 1,
            position: [-(Constants.WIDTH / 2) + 400 , -(Constants.HEIGHT / 2) + Constants.WATER_HEIGHT],
            angularVelocity: 0
        });
        
        this.boat.fromPolygon(this.convertVertices(Constants.BOAT_VERTICES));
        this.world.addBody(this.boat);

        this.world.on('postStep', () => {
            this.moveBoat();
            this.applyAABBBuoyancyForces(this.boat, plane.position, this.k, this.viscosity);
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

    private applyAABBBuoyancyForces(body: any, planePosition: number[], k: number, c: number) {
        let shapePosition: Array<number> = [0,0];
        let shapeAngle: number = 0;
        let aabb: p2.AABB = new p2.AABB();
        let centerOfBouyancy: Array<number> = [0,0];
        let liftForce: Array<number> = [0,0];
        let viscousForce: Array<number> = [0,0];
        let v: Array<number> = [0,0];
        for (var i = 0; i < body.shapes.length; i++) {

            var shape = body.shapes[i];

            // Get shape world transform
            body.vectorToWorldFrame(shapePosition, shape.position);
            p2.vec2.add(shapePosition, shapePosition, body.position);
            shapeAngle = shape.angle + body.angle;

            // Get shape AABB
            shape.computeAABB(aabb, shapePosition, shapeAngle);

            var areaUnderWater;
            if(aabb.upperBound[1] < planePosition[1]){
                // Fully submerged
                p2.vec2.copy(centerOfBouyancy,shapePosition);
                areaUnderWater = shape.area;
            } else if(aabb.lowerBound[1] < planePosition[1]){
                // Partially submerged
                var width = aabb.upperBound[0] - aabb.lowerBound[0];
                var height = (-(Constants.HEIGHT / 2) + Constants.WATER_HEIGHT) - aabb.lowerBound[1];
                areaUnderWater = width * height;
                p2.vec2.set(centerOfBouyancy, aabb.lowerBound[0] + width / 2, aabb.lowerBound[1] + height / 2);
            } else {
                continue;
            }

            // Compute lift force
            p2.vec2.subtract(liftForce, planePosition, centerOfBouyancy);
            p2.vec2.scale(liftForce, liftForce, areaUnderWater * k);
            liftForce[0] = 0;

            // Make center of bouycancy relative to the body
            p2.vec2.subtract(centerOfBouyancy,centerOfBouyancy,body.position);

            // Viscous force
            body.getVelocityAtPoint(v, centerOfBouyancy);
            p2.vec2.scale(viscousForce, v, -c);

            // Apply forces
            body.applyForce(viscousForce,centerOfBouyancy);
            body.applyForce(liftForce,centerOfBouyancy);
        }
    }

    private moveBoat(): void {
        if(this.inputs.move && this.boat.position[0] < Constants.MAX_BOAT_X && this.boat) {
            this.boat.applyForce([200, 0], [0,0]); // X movement
            this.boat.applyForce([0, 40], [60,20]); // Y movement
        } else if (this.boat.position[0] > Constants.MAX_BOAT_X || !this.inputs.move) { 
            this.boat.applyForce([-200, 0], [0,0]); // X movement
            this.boat.applyForce([0, -20], [60,20]); // Y movement
        }
    }

    public update(t: number, deltaTime:number, inputs: IInput): IGameModel {
        this.inputs = inputs;

        this.world.step(t, deltaTime, 10);

        return {
            boat: this.boat,
            debug: this.inputs.debug,
            world: this.world
        };
    }
}