import IInputs from './IInput';

export default class Input {
    private moving: boolean;

    constructor() {
        window.addEventListener('keydown', (event:KeyboardEvent) => {
            if(event.keyCode == 32) { //space
                this.moving = true;
            }
        });

        window.addEventListener('keyup', (event:KeyboardEvent) => {
            if(event.keyCode == 32) { //space
                this.moving = false;
            }
        })
     }

    public update(): IInputs {
        return {
            move: this.moving
        };
    }
}