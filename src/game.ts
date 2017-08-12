import * as p2 from 'p2';
import IGameModel from './IGameModel';
import Constants from './constants';
import IInput from './IInput';

export default class Game {
    private boat:p2.Body;
    private water:p2.Body;
    private world:p2.World;
    private k = 0.1 // up force per submerged "volume"
    private viscosity = 10; // viscosity
    private inputs: IInput;
    private obstacle: p2.Body;

    constructor() {
        this.world = new p2.World({
            gravity: [0, -100]
        });        
        
        // Create "water surface"
        this.water = new p2.Body({
            position:[0, -(Constants.HEIGHT / 2) + Constants.WATER_HEIGHT],
            collisionResponse: false
        });
        this.water.addShape(new p2.Plane());
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
            this.applyAABBBuoyancyForces(this.obstacle, this.water.position, this.k, this.viscosity);
            this.applyAABBBuoyancyForces(this.boat, this.water.position, this.k, this.viscosity);
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