import View from './view';
import Game from './game';
import Input from './input';
import gameModel from './IGameModel';

export class Startup {
    private game:Game;
    private view:View;
    private gameLoop: any;
    private inputHandler: Input;
    private fixedTimeStep: number = 1 / 60;
    private lastTime: number;

    public main(): void {
        this.view = new View();
        this.game = new Game();
        this.inputHandler = new Input();
        this.gameLoop = (t?):void => {
            t = t || 0;
            requestAnimationFrame(this.gameLoop);

            let inputs = this.inputHandler.update();
            
            let deltaTime = this.lastTime ? (t - this.lastTime) / 1000 : 0;
            // Move physics bodies forward in time
            let gameModel = this.game.update(1/60, deltaTime, inputs);

            this.view.render(gameModel);
        }
        this.gameLoop();
    }
}

let start:Startup = new Startup();
start.main();