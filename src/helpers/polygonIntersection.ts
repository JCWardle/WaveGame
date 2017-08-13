import * as p2 from 'p2';
import * as GreinerHormann from 'greiner-hormann';

export default class PolygonIntersection {
    //Returns an array of polygons that intersect with the water.
    //Each polygon is an array of points, each point is an array of 2 with x and y co-ordinates
    public static Intersection(water:p2.Body, polygon:p2.Body): number[][][] {
        let waterVertices: number[][];
        let polygonVertices: number[][];

        waterVertices = this.planeVertices(water);
        polygonVertices = this.polygonVertices(polygon);
        return GreinerHormann.intersection(waterVertices, polygonVertices);
    }


    private static planeVertices(water: p2.Body) {
        let result :number[][] = new Array<number[]>();

        result.push([ water.position[0] - 10000, water.position[1] ]) //topleft
        result.push([ water.position[0] + 10000, water.position[1] ]) //topright
        result.push([ water.position[0] + 10000, water.position[1] - 10000 ]) //bottom left
        result.push([ water.position[0] - 10000, water.position[1] - 10000 ]) //bottom right

        return result;
    }

    private static polygonVertices(polygon: p2.Body) {
        let result :number[][] = new Array<number[]>();

        for(let shape of polygon.shapes) {
            let convex: p2.Convex = <p2.Convex>shape;
            let angle: number= polygon.angle;
            let posX: number = polygon.position[0];
            let poxY: number = polygon.position[1];
            
            let vertices = convex.vertices;
            for(let v in convex.vertices) {
                let vert = p2.vec2.create();
                p2.vec2.rotate(vert, vertices[v], angle);
                let x = vert[0] + polygon.position[0];
                let y = vert[1] + polygon.position[1];
                result.push([x, y]);
            }
        }

        return result;
    }
}