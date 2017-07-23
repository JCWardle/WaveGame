class Startup {
    public static main(): number {
        let canvas:HTMLCanvasElement = document.createElement('canvas');
        canvas.id = 'GameCanvas';
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        document.body.appendChild(canvas);

        let context:CanvasRenderingContext2D = canvas.getContext('2d');
        context.strokeRect(0,0, 500, 500);
        return 0;
    }
}
console.log('Nice!');
Startup.main();