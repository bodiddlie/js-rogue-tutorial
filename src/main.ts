import * as ROT from 'rot-js';

import { handleInput, MovementAction } from './input-handler';
import { Entity } from './entity';

class Engine {
  public static readonly WIDTH = 80;
  public static readonly HEIGHT = 50;

  display: ROT.Display;

  player: Entity;
  npc: Entity;
  entities: Entity[];

  constructor() {
    this.display = new ROT.Display({
      width: Engine.WIDTH,
      height: Engine.HEIGHT,
    });
    const container = this.display.getContainer()!;
    document.body.appendChild(container);

    this.player = new Entity(Engine.WIDTH / 2, Engine.HEIGHT / 2, '@');
    this.npc = new Entity(Engine.WIDTH / 2 - 5, Engine.HEIGHT / 2, '@', '#ff0');
    this.entities = [this.player, this.npc];

    window.addEventListener('keydown', (event) => {
      this.update(event);
    });

    this.render();
  }

  update(event: KeyboardEvent) {
    this.display.clear();
    const action = handleInput(event);

    if (action instanceof MovementAction) {
      this.player.move(action.dx, action.dy);
    }
    this.render();
  }

  render() {
    this.display.draw(
      this.player.x,
      this.player.y,
      this.player.char,
      this.player.fg,
      this.player.bg,
    );
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
