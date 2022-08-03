import { Display } from 'rot-js';
import { BaseScreen } from './base-screen';
import { Actor } from '../entity';
import { Engine } from '../engine';
import { BaseInputHandler, GameInputHandler } from '../input-handler';
import { GameScreen } from './game-screen';

const OPTIONS = [
  '[N] Play a new game',
  '[C] Continue last game', // TODO: hide this option if no save game is present
];

const MENU_WIDTH = 24;

export class MainMenu extends BaseScreen {
  inputHandler: BaseInputHandler;
  constructor(display: Display, player: Actor) {
    super(display, player);
    this.inputHandler = new GameInputHandler();
  }

  update(event: KeyboardEvent): BaseScreen {
    if (event.key === 'n') {
      return new GameScreen(this.display, this.player);
    }

    this.render();

    return this;
  }

  render() {
    this.display.clear();
    OPTIONS.forEach((o, i) => {
      const x = Math.floor(Engine.WIDTH / 2);
      const y = Math.floor(Engine.HEIGHT / 2 - 1 + i);

      this.display.draw(x, y, o.padEnd(MENU_WIDTH, ' '), '#fff', '#000');
    });
  }
}
