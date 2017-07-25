import * as p2 from 'p2'

export default class Game {
    private water;
    private world:p2.World;
    private k = 100; // up force per submerged "volume"
    private c = 0.8; // viscosity

    constructor() {
        this.world = new p2.World({
                gravity : [0,-10]
            });        
        
        // Create "water surface"
        let planeShape: p2.Plane = new p2.Plane();
        let plane: p2.Body = new p2.Body({
            position:[0,0]
        });
        plane.addShape(planeShape);
        this.world.addBody(plane);

        let boat: p2.Body = new p2.Body({
            mass: 1,
            position: [0,2]
        });

        boat.addShape(new p2.Circle ({
            radius: 5
        }));
        this.world.addBody(boat);

        this.world.on('postStep', () => {
            this.applyAABBBuoyancyForces(boat, plane.position, this.k, this.c)
        })
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
                var height = 0 - aabb.lowerBound[1];
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

    public update():void {

    }
}