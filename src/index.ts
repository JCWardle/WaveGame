import View from './view';

export class Startup {
    public static main(): number {
        let view:View = new View();
        view.render();
        return 0;
    }
}

Startup.main();