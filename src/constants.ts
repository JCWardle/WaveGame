export default class Constants {
    public static HEIGHT: number = 1080;
    public static WIDTH: number = 1920;

    public static WATER_HEIGHT: number = 20;
    public static MAX_BOAT_X: number = (1920 / 4); //0 is the middle

    public static BOAT_VERTICES: number[] = [
            0, 0, //bottom left corner
            50, 0, //bottom right
            74, 25, // front point
            0, 25, // back left upper
            0, 0 // back to start
        ];
}