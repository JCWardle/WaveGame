import View from './view';
import Game from './game';
import gameModel from './gameModel';

export class Startup {
    private game:Game;
    private view:View;
    private gameLoop;

    public main(): void {
        this.view = new View();
        this.game = new Game();
        this.gameLoop = (t?):void => {
            t = t || 0;
            requestAnimationFrame(this.gameLoop);
            // Move physics bodies forward in time
            let gameModel = this.game.update(1/60);

            this.view.render(gameModel);
        }
        this.gameLoop();
    }
}

let start:Startup = new Startup();
start.main();