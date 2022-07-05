import * as ROT from 'rot-js';

import { handleInput } from './input-handler';
import { Entity } from './entity';
import { GameMap } from './game-map';

export class Engine {
  public static readonly WIDTH = 80;
  public static readonly HEIGHT = 50;
  public static readonly MAP_WIDTH = 80;
  public static readonly MAP_HEIGHT = 45;

  display: ROT.Display;
  gameMap: GameMap;

  player: Entity;
  entities: Entity[];

  constructor(entities: Entity[], player: Entity) {
    this.entities = entities;
    this.player = player;

    this.display = new ROT.Display({
      width: Engine.WIDTH,
      height: Engine.HEIGHT,
      forceSquareRatio: true,
    });
    const container = this.display.getContainer()!;
    document.body.appendChild(container);

    this.gameMap = new GameMap(
      Engine.MAP_WIDTH,
      Engine.MAP_HEIGHT,
      this.display,
    );

    window.addEventListener('keydown', (event) => {
      this.update(event);
    });

    this.render();
  }

  update(event: KeyboardEvent) {
    this.display.clear();
    const action = handleInput(event);

    if (action) {
      action.perform(this, this.player);
    }
    this.render();
  }

  render() {
    this.gameMap.render();
    this.entities.forEach((e) => {
      this.display.draw(e.x, e.y, e.char, e.fg, e.bg);
    });
  }
}
