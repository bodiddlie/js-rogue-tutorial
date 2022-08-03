import * as ROT from 'rot-js';

import {
  BaseInputHandler,
  GameInputHandler,
  InputState,
} from './input-handler';
import { Actor } from './entity';
import { GameMap } from './game-map';
import { generateDungeon } from './procgen';
import {
  renderFrameWithTitle,
  renderHealthBar,
  renderNamesAtLocation,
} from './render-functions';
import { Colors } from './colors';
import { Action } from './actions';
import { ImpossibleException } from './exceptions';

export class Engine {
  public static readonly WIDTH = 80;
  public static readonly HEIGHT = 50;
  public static readonly MAP_WIDTH = 80;
  public static readonly MAP_HEIGHT = 43;
  public static readonly MIN_ROOM_SIZE = 6;
  public static readonly MAX_ROOM_SIZE = 10;
  public static readonly MAX_ROOMS = 30;
  public static readonly MAX_MONSTERS_PER_ROOM = 2;
  public static readonly MAX_ITEMS_PER_ROOM = 2;

  display: ROT.Display;
  gameMap: GameMap;
  inputHandler: BaseInputHandler;

  constructor(public player: Actor) {
    this.display = new ROT.Display({
      width: Engine.WIDTH,
      height: Engine.HEIGHT,
      forceSquareRatio: true,
    });
    const container = this.display.getContainer()!;
    document.body.appendChild(container);

    this.inputHandler = new GameInputHandler();

    this.gameMap = generateDungeon(
      Engine.MAP_WIDTH,
      Engine.MAP_HEIGHT,
      Engine.MAX_ROOMS,
      Engine.MIN_ROOM_SIZE,
      Engine.MAX_ROOM_SIZE,
      Engine.MAX_MONSTERS_PER_ROOM,
      Engine.MAX_ITEMS_PER_ROOM,
      player,
      this.display,
    );

    window.addEventListener('keydown', (event) => {
      this.update(event);
    });

    window.addEventListener('mousemove', (event) => {
      this.inputHandler.handleMouseMovement(
        this.display.eventToPosition(event),
      );
      this.render();
    });

    this.gameMap.updateFov(this.player);
  }

  handleEnemyTurns() {
    this.gameMap.actors.forEach((e) => {
      if (e.isAlive) {
        try {
          e.ai?.perform(e);
        } catch {}
      }
    });
  }

  update(event: KeyboardEvent) {
    const action = this.inputHandler.handleKeyboardInput(event);
    if (action instanceof Action) {
      try {
        action.perform(this.player);
        this.handleEnemyTurns();
        this.gameMap.updateFov(this.player);
      } catch (error) {
        if (error instanceof ImpossibleException) {
          window.messageLog.addMessage(error.message, Colors.Impossible);
        }
      }
    }

    this.inputHandler = this.inputHandler.nextHandler;

    this.render();
  }

  render() {
    this.display.clear();
    window.messageLog.render(this.display, 21, 45, 40, 5);

    renderHealthBar(
      this.display,
      this.player.fighter.hp,
      this.player.fighter.maxHp,
      20,
    );

    renderNamesAtLocation(21, 44, this.inputHandler.mousePosition);

    this.gameMap.render();

    if (this.inputHandler.inputState === InputState.Log) {
      renderFrameWithTitle(3, 3, 74, 38, 'Message History');
      window.messageLog.renderMessages(
        this.display,
        4,
        4,
        72,
        36,
        window.messageLog.messages.slice(
          0,
          this.inputHandler.logCursorPosition + 1,
        ),
      );
    }
    if (this.inputHandler.inputState === InputState.UseInventory) {
      this.renderInventory('Select an item to use');
    }
    if (this.inputHandler.inputState === InputState.DropInventory) {
      this.renderInventory('Select an item to drop');
    }
    if (this.inputHandler.inputState === InputState.Target) {
      const [x, y] = this.inputHandler.mousePosition;
      this.display.drawOver(x, y, null, '#000', '#fff');
    }
    this.inputHandler.onRender(this.display);
  }

  renderInventory(title: string) {
    const itemCount = this.player.inventory.items.length;
    const height = itemCount + 2 <= 3 ? 3 : itemCount + 2;
    const width = title.length + 4;
    const x = this.player.x <= 30 ? 40 : 0;
    const y = 0;

    renderFrameWithTitle(x, y, width, height, title);

    if (itemCount > 0) {
      this.player.inventory.items.forEach((i, index) => {
        const key = String.fromCharCode('a'.charCodeAt(0) + index);
        this.display.drawText(x + 1, y + index + 1, `(${key}) ${i.name}`);
      });
    } else {
      this.display.drawText(x + 1, y + 1, '(Empty)');
    }
  }
}
