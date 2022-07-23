import * as ROT from 'rot-js';

import { handleInput } from './input-handler';
import { Actor } from './entity';
import { GameMap } from './game-map';
import { generateDungeon } from './procgen';
import { renderHealthBar } from './render-functions';
import { MessageLog } from './message-log';
import { Colors } from './colors';

export class Engine {
  public static readonly WIDTH = 80;
  public static readonly HEIGHT = 50;
  public static readonly MAP_WIDTH = 80;
  public static readonly MAP_HEIGHT = 43;
  public static readonly MIN_ROOM_SIZE = 6;
  public static readonly MAX_ROOM_SIZE = 10;
  public static readonly MAX_ROOMS = 30;
  public static readonly MAX_MONSTERS_PER_ROOM = 2;

  display: ROT.Display;
  gameMap: GameMap;
  messageLog: MessageLog;

  constructor(public player: Actor) {
    this.display = new ROT.Display({
      width: Engine.WIDTH,
      height: Engine.HEIGHT,
      forceSquareRatio: true,
    });
    const container = this.display.getContainer()!;
    document.body.appendChild(container);

    this.messageLog = new MessageLog();
    this.messageLog.addMessage(
      'Hello and welcome, adventurer, to yet another dungeon!',
      Colors.WelcomeText,
    );

    this.gameMap = generateDungeon(
      Engine.MAP_WIDTH,
      Engine.MAP_HEIGHT,
      Engine.MAX_ROOMS,
      Engine.MIN_ROOM_SIZE,
      Engine.MAX_ROOM_SIZE,
      Engine.MAX_MONSTERS_PER_ROOM,
      player,
      this.display,
    );

    window.addEventListener('keydown', (event) => {
      this.update(event);
    });

    this.gameMap.updateFov(this.player);
    this.render();
  }

  handleEnemyTurns() {
    this.gameMap.actors.forEach((e) => {
      if (e.isAlive) {
        e.ai?.perform(e);
      }
    });
  }

  update(event: KeyboardEvent) {
    this.display.clear();

    if (this.player.fighter.hp > 0) {
      const action = handleInput(event);

      if (action) {
        action.perform(this.player);
        this.handleEnemyTurns();
      }
    }

    this.gameMap.updateFov(this.player);
    this.render();
  }

  render() {
    this.messageLog.render(this.display, 21, 45, 40, 5);

    renderHealthBar(
      this.display,
      this.player.fighter.hp,
      this.player.fighter.maxHp,
      20,
    );
    this.gameMap.render();
  }
}
