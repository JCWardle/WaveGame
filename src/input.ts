import IInputs from './IInput';

export default class Input {
    private moving: boolean;
    private debug: boolean;

    constructor() {
        window.addEventListener('keydown', (event:KeyboardEvent) => {
            if(event.keyCode == 32) { //space
                this.moving = true;
            }
        });

        window.addEventListener('keyup', (event:KeyboardEvent) => {
            if(event.keyCode == 32) { //space
                this.moving = false;
            } else if(event.keyCode == 68) { //d
                this.debug = !this.debug;
            }
        })
     }

    public update(): IInputs {
        return {
            move: this.moving,
            debug: this.debug
        };
    }
}