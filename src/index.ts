import View from './view';
import Game from './game';

export class Startup {
    public static main(): number {
        let view:View = new View();
        let game:Game = new Game();

        game.update();
        view.render();
        return 0;
    }
}

Startup.main();