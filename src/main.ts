import * as ROT from 'rot-js';

import { handleInput, MovementAction } from './input-handler';

class Engine {
  public static readonly WIDTH = 80;
  public static readonly HEIGHT = 50;

  display: ROT.Display;

  playerX: number;
  playerY: number;

  constructor() {
    this.display = new ROT.Display({
      width: Engine.WIDTH,
      height: Engine.HEIGHT,
    });
    const container = this.display.getContainer()!;
    document.body.appendChild(container);

    this.playerX = Engine.WIDTH / 2;
    this.playerY = Engine.HEIGHT / 2;

    window.addEventListener('keydown', (event) => {
      this.update(event);
    });

    this.render();
  }

  update(event: KeyboardEvent) {
    this.display.clear();
    const action = handleInput(event);

    if (action instanceof MovementAction) {
      this.playerX += action.dx;
      this.playerY += action.dy;
    }
    this.render();
  }

  render() {
    this.display.draw(this.playerX, this.playerY, '@', '#fff', '#000');
  }
}

declare global {
  interface Window {
    engine: Engine;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.engine = new Engine();
});
